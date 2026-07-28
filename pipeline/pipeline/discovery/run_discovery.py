"""
Discovery orchestrator: runs every domain's query templates against every
discovery source, collects the results, and writes the raw (pre-dedup,
pre-classification) pool to data/raw/ for audit/re-run purposes.

Callable as a function (`run_discovery(...)`) so it composes into the larger
pipeline orchestrator, or as a script for a standalone discovery pass.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import yaml

from config import settings
from pipeline.discovery import arxiv_source, semantic_scholar_source, openalex_source, crossref_source
from pipeline.storage.schema import Record

SOURCES = {
    "arxiv": arxiv_source.search,
    "semantic_scholar": semantic_scholar_source.search,
    "openalex": openalex_source.search,
    "crossref": crossref_source.search,
}


def load_search_templates(path: Path = settings.SEARCH_TEMPLATES_YAML) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def run_discovery(
    *,
    domains: list[str] | None = None,
    sources: list[str] | None = None,
    results_per_query: int = settings.RESULTS_PER_QUERY,
    sleep_between_calls: float = 0.4,
    templates_path: Path = settings.SEARCH_TEMPLATES_YAML,
) -> list[Record]:
    """Run discovery across the requested domains/sources (default: all).

    Returns the raw (undeduplicated) list of Records found. Also writes a
    timestamped snapshot to data/raw/ for audit.
    """
    config = load_search_templates(templates_path)
    all_domains = config["domains"]
    target_domains = domains or list(all_domains.keys())
    target_sources = sources or list(SOURCES.keys())

    results: list[Record] = []
    stats: dict[str, dict[str, int]] = {}

    for domain_id in target_domains:
        domain_cfg = all_domains[domain_id]
        for query in domain_cfg["queries"]:
            for source_name in target_sources:
                search_fn = SOURCES[source_name]
                stats.setdefault(source_name, {"ok": 0, "errors": 0, "records": 0})
                try:
                    found = search_fn(query, max_results=results_per_query)
                    results.extend(found)
                    stats[source_name]["ok"] += 1
                    stats[source_name]["records"] += len(found)
                except Exception as exc:  # noqa: BLE001 - keep discovery moving even if one source/query fails
                    stats[source_name]["errors"] += 1
                    print(f"[discovery] {source_name} failed for domain={domain_id} query={query!r}: {exc}", file=sys.stderr)
                time.sleep(sleep_between_calls)  # be polite to free/shared-tier APIs

    print("[discovery] summary:", json.dumps(stats, indent=2))

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_path = settings.RAW_DIR / f"raw_papers_{timestamp}.json"
    out_path.write_text(
        json.dumps([r.to_dict() for r in results], ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"[discovery] wrote {len(results)} raw records to {out_path}")

    return results


def main():
    parser = argparse.ArgumentParser(description="Run the discovery stage.")
    parser.add_argument("--domains", nargs="*", help="Domain ids to search (default: all, e.g. TD1 TD2)")
    parser.add_argument("--sources", nargs="*", help="Sources to query (default: all)")
    parser.add_argument("--results-per-query", type=int, default=settings.RESULTS_PER_QUERY)
    args = parser.parse_args()

    run_discovery(domains=args.domains, sources=args.sources, results_per_query=args.results_per_query)


if __name__ == "__main__":
    main()
