"""
Minimal static JSON "endpoint" for the exported dataset — the Week-4
milestone requirement of "a JSON export or a simple REST/static JSON
endpoint serving the data". No new dependencies: stdlib http.server serving
data/exports/ directly, so:

    GET /classified.json
    GET /excluded.json
    GET /all_records.json
    GET /manifest.json

Run:  python scripts/serve_api.py [port]   (default port 8000)

This is deliberately the simplest thing that satisfies the requirement. If
the frontend needs query params / filtering, swap this for a small
FastAPI/Flask app that reads the same data/exports/*.json files — the data
shape doesn't change either way.
"""

from __future__ import annotations

import functools
import http.server
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXPORTS_DIR = PROJECT_ROOT / "data" / "exports"


class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    if not EXPORTS_DIR.exists():
        print(f"No exports found at {EXPORTS_DIR}. Run the pipeline first (scripts/run_pipeline.py).")
        sys.exit(1)

    handler = functools.partial(CORSRequestHandler, directory=str(EXPORTS_DIR))
    with http.server.ThreadingHTTPServer(("0.0.0.0", port), handler) as httpd:
        print(f"Serving {EXPORTS_DIR} at http://localhost:{port}/  (e.g. http://localhost:{port}/classified.json)")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
