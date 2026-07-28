"""
Top-level pipeline orchestrator. Each stage is a plain callable function with
no shared global/notebook state — this module just calls them in sequence and
passes data between them, so it's straightforward to later wrap in a
scheduler (cron / Airflow / cloud function) without a rewrite: call
run_full_pipeline() on a schedule instead of from __main__.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

from config import settings
from pipeline.discovery.run_discovery import run_discovery
from pipeline.dedup.dedup import deduplicate
from pipeline.classification.embed import EmbeddingIndex
from pipeline.classification.classify import classify_records
from pipeline.storage import json_export
from pipeline.storage.schema import Record


def _snapshot(records: list[Record], directory, name: str) -> None:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = directory / f"{name}_{timestamp}.json"
    path.write_text(json.dumps([r.to_dict() for r in records], ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[orchestrate] wrote {len(records)} records to {path}")


def run_full_pipeline(
    *,
    domains: list[str] | None = None,
    sources: list[str] | None = None,
    results_per_query: int = settings.RESULTS_PER_QUERY,
    write_to_sheets: bool = False,
) -> dict:
    """Runs discovery -> dedup -> classification -> (optional) Sheets write -> JSON export.

    Returns a summary dict. Safe to call repeatedly (re-runnable): each stage
    writes its own timestamped snapshot to data/ before handing off, so a
    partial failure downstream doesn't lose upstream work.
    """
    print("=== Stage 1/4: discovery ===")
    raw_records = run_discovery(domains=domains, sources=sources, results_per_query=results_per_query)

    print("\n=== Stage 2/4: deduplication ===")
    unique_records, dedup_log = deduplicate(raw_records)
    print(f"[orchestrate] {len(raw_records)} raw -> {len(unique_records)} unique "
          f"({len(dedup_log)} duplicates removed)")
    _snapshot(unique_records, settings.PROCESSED_DIR, "deduped")

    print("\n=== Stage 3/4: classification ===")
    embedding_index = EmbeddingIndex()
    classified_or_review, excluded = classify_records(unique_records, embedding_index=embedding_index)
    _snapshot(classified_or_review, settings.CLASSIFIED_DIR, "classified")
    _snapshot(excluded, settings.EXCLUDED_DIR, "excluded")

    print("\n=== Stage 4/4: storage + export ===")
    sheets_write_ok = None  # None = skipped, True = wrote, False = failed
    if write_to_sheets:
        from pipeline.storage import sheets_store
        try:
            sheets_store.write_records(classified_or_review, "classified")
            sheets_store.write_records(excluded, "excluded")
            print("[orchestrate] wrote records to Google Sheets")
            sheets_write_ok = True
        except Exception as exc:  # noqa: BLE001 - Sheets is not the source of truth; JSON export must still run
            # gspread raises some errors (e.g. PermissionError) bare, chained
            # from the real cause via `raise ... from ex` - str(exc) alone
            # would print an empty message, so surface the cause too.
            detail = exc.__cause__ if exc.__cause__ is not None and not str(exc) else exc
            print(f"[orchestrate] Google Sheets write failed, continuing to JSON export: {detail}")
            sheets_write_ok = False

    # Always runs, regardless of the Sheets outcome above - this is the
    # standalone deliverable a frontend can depend on even if Sheets isn't
    # configured or is temporarily unreachable.
    manifest = json_export.export_json(classified_or_review, excluded)

    return {
        "raw_count": len(raw_records),
        "unique_count": len(unique_records),
        "duplicates_removed": len(dedup_log),
        "sheets_write_ok": sheets_write_ok,
        "manifest": manifest,
    }
