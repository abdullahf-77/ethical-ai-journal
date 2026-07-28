"""
CLI entry point for a manual pipeline run. Structured as a thin wrapper
around pipeline.orchestrate.run_full_pipeline so the exact same call can be
scheduled (cron, cloud function, etc.) later without touching this file.

Examples:
    python scripts/run_pipeline.py
    python scripts/run_pipeline.py --domains TD1 TD7 --results-per-query 10
    python scripts/run_pipeline.py --write-to-sheets
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import settings
from pipeline.orchestrate import run_full_pipeline


def main():
    parser = argparse.ArgumentParser(description="Run the full paper-sourcing pipeline.")
    parser.add_argument("--domains", nargs="*", help="Top-domain ids to search, e.g. TD1 TD2 (default: all 7)")
    parser.add_argument("--sources", nargs="*", help="Discovery sources, e.g. arxiv openalex (default: all)")
    parser.add_argument("--results-per-query", type=int, default=settings.RESULTS_PER_QUERY)
    parser.add_argument("--write-to-sheets", action="store_true", help="Also write results to Google Sheets")
    args = parser.parse_args()

    summary = run_full_pipeline(
        domains=args.domains,
        sources=args.sources,
        results_per_query=args.results_per_query,
        write_to_sheets=args.write_to_sheets,
    )
    print("\n=== SUMMARY ===")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
