"""
JSON export stage — the standalone Week-4 milestone deliverable, independent
of the Google Sheets storage backend. Writes structured JSON that a frontend
(or `scripts/serve_api.py`) can consume directly. domains/subdomains are
written as real JSON arrays, never joined strings.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

from config import settings
from pipeline.storage.schema import Record


def export_json(
    classified_or_review: list[Record],
    excluded: list[Record],
    out_dir=settings.EXPORTS_DIR,
) -> dict:
    """Writes:
        classified.json  - relevant records (review_status in {classified, needs_review})
        excluded.json    - excluded records, kept for audit
        all_records.json - everything, one file
        manifest.json     - counts + metadata, so a frontend/endpoint can show freshness

    Returns the manifest dict.
    """
    out_dir.mkdir(parents=True, exist_ok=True)

    classified_payload = [r.to_dict() for r in classified_or_review]
    excluded_payload = [r.to_dict() for r in excluded]

    (out_dir / "classified.json").write_text(
        json.dumps(classified_payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "excluded.json").write_text(
        json.dumps(excluded_payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "all_records.json").write_text(
        json.dumps(classified_payload + excluded_payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    needs_review_count = sum(1 for r in classified_or_review if r.review_status == "needs_review")
    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "taxonomy_version": settings.TAXONOMY_VERSION,
        "counts": {
            "classified_or_review_total": len(classified_or_review),
            "classified": len(classified_or_review) - needs_review_count,
            "needs_review": needs_review_count,
            "excluded": len(excluded),
        },
        "files": ["classified.json", "excluded.json", "all_records.json"],
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[export] wrote {len(classified_payload)} classified/review + {len(excluded_payload)} excluded records to {out_dir}")
    return manifest
