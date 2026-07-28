"""
Central configuration for the pipeline. All stages import from here instead of
reading env vars / paths directly, so there is exactly one place that knows
about file locations, API keys, and tunable thresholds.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# --------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

load_dotenv(PROJECT_ROOT / ".env")  # no-op if the file doesn't exist; real env vars still take precedence


def _env(key: str, default: str | None = None) -> str | None:
    """os.environ.get, but treats a present-and-blank var (e.g. `KEY=` left
    empty in .env) the same as an absent one, so defaults below still apply."""
    val = os.environ.get(key)
    return val if val else default

TAXONOMY_JSON = PROJECT_ROOT / "taxonomy" / "taxonomy_v2_7domains.json"
SEARCH_TEMPLATES_YAML = PROJECT_ROOT / "config" / "search_templates.yaml"

DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"          # after dedup
CLASSIFIED_DIR = DATA_DIR / "classified"        # relevant, classified >= threshold or in review queue
EXCLUDED_DIR = DATA_DIR / "excluded"            # not relevant to any domain, kept for audit
EXPORTS_DIR = DATA_DIR / "exports"              # final JSON export / static endpoint payloads

for d in (RAW_DIR, PROCESSED_DIR, CLASSIFIED_DIR, EXCLUDED_DIR, EXPORTS_DIR):
    d.mkdir(parents=True, exist_ok=True)

# --------------------------------------------------------------------------
# Taxonomy
# --------------------------------------------------------------------------

TAXONOMY_VERSION = "v2"

# --------------------------------------------------------------------------
# Discovery
# --------------------------------------------------------------------------

CONTACT_EMAIL = _env("PIPELINE_CONTACT_EMAIL", "example@example.com")
USER_AGENT = f"paper-sourcing-pipeline/1.0 (mailto:{CONTACT_EMAIL})"

# Results requested per query per source, per domain. Kept small by default
# so a full run stays cheap; raise for a deeper sweep.
RESULTS_PER_QUERY = int(_env("PIPELINE_RESULTS_PER_QUERY", "15"))

CORE_API_KEY = _env("CORE_API_KEY")  # optional: CORE source is not wired in by default (see README)

# --------------------------------------------------------------------------
# Deduplication
# --------------------------------------------------------------------------

FUZZY_TITLE_THRESHOLD = int(_env("PIPELINE_FUZZY_TITLE_THRESHOLD", "92"))  # token_sort_ratio 0-100

# --------------------------------------------------------------------------
# Classification
# --------------------------------------------------------------------------

EMBEDDING_MODEL_NAME = _env("PIPELINE_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# cosine similarity threshold for a domain/subdomain to make the embedding
# shortlist (pre-filter, before the LLM confirmation pass)
EMBEDDING_SHORTLIST_THRESHOLD = float(_env("PIPELINE_EMBED_THRESHOLD", "0.30"))
EMBEDDING_SHORTLIST_TOP_K = int(_env("PIPELINE_EMBED_TOP_K", "8"))  # max subdomains shortlisted per paper

# Which LLM backend the classification confirmation pass uses: "anthropic" (default) or "gemini".
LLM_PROVIDER = _env("LLM_PROVIDER", "anthropic").lower()

ANTHROPIC_API_KEY = _env("ANTHROPIC_API_KEY")
GEMINI_API_KEY = _env("GEMINI_API_KEY")

_DEFAULT_MODEL_BY_PROVIDER = {
    "anthropic": "claude-sonnet-5",
    # gemini-pro-latest: 429, free-tier quota limit 0 (billing not enabled).
    # gemini-flash-latest (-> gemini-3.6-flash): free tier is only 20
    # requests/DAY per project - exhausted by ordinary testing in a single
    # session. gemini-flash-lite-latest has its own separate quota bucket and
    # was verified working end-to-end (2026-07-26, 4/4 real classification
    # calls succeeded with sensible multi-label results). Switch to
    # gemini-pro-latest or gemini-flash-latest once billing is enabled on the
    # GCP project, for higher-quality classification at real run volumes.
    "gemini": "gemini-flash-lite-latest",
}
LLM_MODEL_NAME = _env("PIPELINE_LLM_MODEL", _DEFAULT_MODEL_BY_PROVIDER.get(LLM_PROVIDER, "claude-sonnet-5"))

# below this confidence, a classified record is routed to the human review queue
REVIEW_CONFIDENCE_THRESHOLD = float(_env("PIPELINE_REVIEW_THRESHOLD", "0.55"))

# --------------------------------------------------------------------------
# Storage (Google Sheets)
# --------------------------------------------------------------------------

GOOGLE_SERVICE_ACCOUNT_JSON = _env("GOOGLE_SERVICE_ACCOUNT_JSON")  # path to credentials file
GOOGLE_SHEET_ID = _env("PIPELINE_GOOGLE_SHEET_ID")  # target spreadsheet id
