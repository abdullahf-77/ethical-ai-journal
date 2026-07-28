# Paper Sourcing Pipeline

Backend pipeline that discovers academic papers, deduplicates them, classifies
them against a 7-domain AI-ethics/governance taxonomy, and exports a
structured dataset a frontend can consume. Built for the Weeks 3-4 task.

Everything in this directory is new; the only files it reads (never writes)
are the two read-only taxonomy workbooks on the Desktop.

## Decisions made (flagged defaults — override via env vars if you disagree)

These were confirmed with the user before building, but are recorded here for
anyone else reading the code:

| Decision | Choice | Why |
|---|---|---|
| Embedding model | local `sentence-transformers/all-MiniLM-L6-v2` | No API key, runs offline, free. Swap via `PIPELINE_EMBEDDING_MODEL`. |
| Classification LLM | Claude (`claude-sonnet-5`) via Anthropic **or** Gemini (`gemini-flash-latest`) via Google | Both give reliable forced-structured output (Anthropic tool-use / Gemini `response_schema` JSON mode). Pick via `LLM_PROVIDER=anthropic\|gemini` in `.env`; model name overridable via `PIPELINE_LLM_MODEL`. See `pipeline/classification/llm_classify.py`. |
| Discovery sources | arXiv + Semantic Scholar + **OpenAlex + Crossref** | Both new sources are free and keyless. CORE was considered but not added (needs a registered key) — see "Adding CORE" below if you want it. |
| Storage backend | **Google Sheets API** | Volume is expected to stay in the hundreds/low-thousands. Sheets is free, needs no infrastructure, and — importantly — is directly editable by a non-engineer for the human review queue. If volume grows past the low-thousands, swap `pipeline/storage/sheets_store.py` for a Postgres/Supabase-backed module implementing the same `write_records`/`read_records` interface; nothing else in the pipeline needs to change. |

## Phase 0 — taxonomy consolidation (15 -> 7 domains)

`taxonomy/build_taxonomy_v2.py` reads `Unified Taxonomy` and `Unified Source
Mapping` from the read-only
`C:\Users\afs12\Desktop\taxonomy_completed_unified.xlsx`, groups the 15
domains into 7 top-level domains by genuine conceptual overlap (the grouping
map and per-group rationale is in the script and duplicated in
`taxonomy_v2_grouping_rationale.md`), and writes:

- `taxonomy/taxonomy_v2_7domains.json` — the full 7 -> 15 -> subdomains hierarchy plus a provenance table back to the original 12 frameworks.
- `taxonomy/taxonomy_v2_7domains.xlsx` — the same data as 4 readable sheets (Top Domains, 15 Domains, Subdomains, Provenance).
- `taxonomy/taxonomy_v2_grouping_rationale.md` — human-readable explanation of why each of the 7 groups was formed.

This is `taxonomy_version = "v2"`, referenced by every record's
`taxonomy_version` field downstream. Re-run any time with:

```
python taxonomy/build_taxonomy_v2.py
```

It fully regenerates its 3 outputs from the source workbook every time (no
incremental state) and never touches the source `.xlsx`.

## Pipeline stages

```
discovery  ->  dedup  ->  classification  ->  storage + export
(4 APIs)       (3-stage)  (embed + LLM)       (Sheets + JSON)
```

Each stage is a plain Python function with no shared/global state — see
`pipeline/orchestrate.py`, which just calls them in order. That's what makes
"turn this into a scheduled weekly job" a matter of calling
`run_full_pipeline()` from a cron/cloud-function entry point instead of
`scripts/run_pipeline.py`'s `__main__` block; no rewrite needed.

### 1. Discovery (`pipeline/discovery/`)

Four sources, each an independent module exposing `search(query, max_results)
-> list[Record]`:

- `arxiv_source.py` — arXiv API (keyless).
- `semantic_scholar_source.py` — Semantic Scholar Graph API (keyless; unauthenticated tier is shared and can 429 under load — set `SEMANTIC_SCHOLAR_API_KEY` for a much higher personal limit).
- `openalex_source.py` — OpenAlex Works API (keyless; reconstructs abstracts from OpenAlex's inverted-index format).
- `crossref_source.py` — Crossref Works API (keyless; strips JATS XML tags from abstracts when present).

All four were hit live and verified on 2026-07-23 before writing the
connectors — not assumed from cached knowledge (OpenAlex's inverted-index
abstract format and Crossref's JATS-tagged abstracts in particular were
confirmed against real responses, not docs).

Per-domain search query templates live in `config/search_templates.yaml`,
keyed by the 7 top domains (`TD1`-`TD7`), built from each domain's actual
constituent subdomain vocabulary (see the file's queries vs.
`taxonomy/taxonomy_v2_7domains.json`) — not one generic list reused
everywhere. Bump `template_version` in that file if you edit the queries.

`run_discovery.py` iterates every domain x query x source, is resilient to
per-call failures (logs and continues), and snapshots the raw pool to
`data/raw/raw_papers_<timestamp>.json`.

**Adding CORE:** to add it as a 5th source, create
`pipeline/discovery/core_source.py` following the same `search()` signature
as the other four (CORE's API: `https://api.core.ac.uk/v3/search/works/`,
needs `CORE_API_KEY` — verify current docs before wiring it up, per the same
practice used for the other four), then add it to the `SOURCES` dict in
`run_discovery.py`.

### 2. Deduplication (`pipeline/dedup/dedup.py`)

Three stages, fixed order, each independently testable (see
`tests/test_dedup.py`, no network calls):

1. Exact DOI match (normalized: lowercased, `https://doi.org/` prefix stripped).
2. Exact normalized-title match (lowercased, punctuation stripped, whitespace collapsed).
3. Fuzzy title match — `rapidfuzz.fuzz.token_sort_ratio`, threshold 92 by default (`PIPELINE_FUZZY_TITLE_THRESHOLD`).

When two records merge, the survivor is filled in with any fields it was
missing (DOI, abstract, link, date) from the duplicate before the duplicate
is dropped — no information is discarded, only the extra row.

Run the tests: `python tests/test_dedup.py`

### 3. Classification (`pipeline/classification/`)

**Embedding pre-filter** (`embed.py`): embeds every paper's title+abstract
and every taxonomy target — each of the 7 domain definitions AND each of the
286 subdomain scope texts (293 targets total) — with the local
sentence-transformers model, and cosine-similarity shortlists the top
matches (threshold `PIPELINE_EMBED_THRESHOLD`, capped at
`PIPELINE_EMBED_TOP_K`). Multi-label by construction — every target above
threshold is kept, not just the single best.

**LLM confirmation** (`llm_classify.py`): sends the paper + the embedding
shortlist + all 7 top-domain definitions to an LLM via a forced-structured-
output call (Anthropic tool-use with `tool_choice` forced, or Gemini
`response_schema` JSON mode — same schema, provider chosen by
`LLM_PROVIDER`). The LLM can confirm, drop, or add domains/subdomains outside
what the embedding step shortlisted — its decision is what gets written to
the final record, full stop. When it disagrees with the shortlist,
`classify.py` appends `[LLM overrode embedding shortlist]` to the stored
`rationale` so the override is visible in the data, not just logged and
thrown away. The same call also produces `ai_summary` and `rationale`.

Switching providers is a `.env` change only, no code edits:
```bash
LLM_PROVIDER=anthropic   # uses ANTHROPIC_API_KEY, default model claude-sonnet-5
LLM_PROVIDER=gemini      # uses GEMINI_API_KEY, default model gemini-flash-lite-latest
```
Verified live 2026-07-26 with both providers, including a full
discovery -> dedup -> classify -> Sheets -> JSON-export run. Gemini free-tier
quotas turned out to vary sharply and unpredictably by model on this
project, all discovered live rather than from docs:
- `gemini-*-pro*`: `429` with quota limit **0** (no billing enabled on the GCP project).
- `gemini-flash-latest` (currently resolves to `gemini-3.6-flash`): only **20 requests/day** per project on the free tier - exhausted after normal testing volume in a single session.
- `gemini-flash-lite-latest` (the default): its own separate quota bucket, confirmed working through a real pipeline run.

`llm_classify.py`'s Gemini backend retries on `429` with backoff (15s/30s/60s)
before giving up on a paper, same pattern as the Semantic Scholar discovery
source - but that only helps with per-minute limits, not a daily cap. If you
hit `RESOURCE_EXHAUSTED` with `GenerateRequestsPerDay...`, either wait for
the daily reset, switch `PIPELINE_LLM_MODEL` to a model with separate quota,
or enable billing on the GCP project tied to `GEMINI_API_KEY` (billing
unlocks the standard, much higher tier - see
https://ai.google.dev/gemini-api/docs/rate-limits).

**Routing** (`classify.py`): confidence >= `PIPELINE_REVIEW_THRESHOLD`
(default 0.55) -> `review_status = classified`; below it ->
`review_status = needs_review` (the human review queue); LLM says
irrelevant -> `review_status = excluded`, `domains`/`subdomains` cleared, but
the record is kept (not deleted) for audit.

### 4. Storage + export (`pipeline/storage/`)

- `schema.py` — the `Record` dataclass, the single schema every stage reads/writes. See `docs/SCHEMA.md`.
- `sheets_store.py` — Google Sheets backend (source of truth). `write_records()` / `read_records()`.
- `json_export.py` — writes `data/exports/{classified,excluded,all_records,manifest}.json`. This runs regardless of whether Sheets is configured — it's the standalone Week-4 deliverable.

`scripts/serve_api.py` serves `data/exports/` over HTTP as a trivial static
JSON "endpoint" (`GET /classified.json`, etc.) with no new dependencies —
swap for a real FastAPI/Flask app later if the frontend needs
filtering/query params; the underlying JSON shape doesn't change.

## Setup

```bash
cd paper_sourcing_pipeline
pip install -r requirements.txt
cp .env.example .env   # fill in LLM_PROVIDER + its API key, GOOGLE_SERVICE_ACCOUNT_JSON, PIPELINE_GOOGLE_SHEET_ID
```

`.env` is loaded automatically (via `python-dotenv`, wired into
`config/settings.py`) — no need to `export` anything manually.

Required for a full run:
- `LLM_PROVIDER` + matching key — `anthropic` + `ANTHROPIC_API_KEY` (https://console.anthropic.com/) or `gemini` + `GEMINI_API_KEY` (https://aistudio.google.com/apikey).
- `GOOGLE_SERVICE_ACCOUNT_JSON` — path to a service-account credentials file (Google Cloud Console -> IAM & Admin -> Service Accounts -> enable Sheets API -> share your target spreadsheet with the service account's `...@...iam.gserviceaccount.com` email as an Editor).
- `PIPELINE_GOOGLE_SHEET_ID` — the id from your spreadsheet's URL.

Everything else in `.env.example` is optional with a sensible default.

## Running it

Full pipeline (all 7 domains, all 4 sources):
```bash
python scripts/run_pipeline.py --write-to-sheets
```

A narrower/cheaper run while testing:
```bash
python scripts/run_pipeline.py --domains TD1 TD7 --sources arxiv openalex --results-per-query 5
```

Without `--write-to-sheets`, the pipeline still runs discovery -> dedup ->
classification -> JSON export; it just skips the Google Sheets write (useful
if you haven't set up credentials yet, or only want the JSON deliverable).

Serve the JSON export locally:
```bash
python scripts/serve_api.py
# -> http://localhost:8000/classified.json
```

Run stages individually (each is also independently callable from Python):
```bash
python -m pipeline.discovery.run_discovery --domains TD1 --results-per-query 5
python tests/test_dedup.py
```

## Known limitations

- Semantic Scholar's unauthenticated tier is a shared, aggressively
  rate-limited pool — during a full run you will likely see some 429s logged
  and skipped for that source/query combination (the run continues; it
  doesn't fail). Get a free key and set `SEMANTIC_SCHOLAR_API_KEY` before a
  real run for reliable coverage from that source.
- The embedding pre-filter and LLM call are per-paper, sequential. Fine for
  the discovery volumes here (hundreds/run); if that becomes a bottleneck,
  batch the embedding step (already vectorized per-call) and/or parallelize
  the LLM calls in `classify.py`.
- No incremental/upsert logic yet — each run's Sheets write is a full
  overwrite of the two worksheets. Fine for a manually re-run pipeline;
  needed before this becomes a scheduled weekly job without reprocessing
  everything (or before duplicate discovery across runs is a concern).

## Project layout

```
paper_sourcing_pipeline/
  taxonomy/                    Phase 0: 15->7 domain consolidation
    build_taxonomy_v2.py
    taxonomy_v2_7domains.json
    taxonomy_v2_7domains.xlsx
    taxonomy_v2_grouping_rationale.md
  config/
    settings.py                 all paths/env-vars/thresholds, one place
    search_templates.yaml       per-domain query templates (versioned config)
  pipeline/
    discovery/                  4 source modules + orchestrator
    dedup/                      3-stage dedup module
    classification/             embedding prefilter + LLM confirmation
    storage/                    schema, Sheets backend, JSON export
    orchestrate.py              ties the 4 stages together
  scripts/
    run_pipeline.py              CLI entry point
    serve_api.py                  static JSON "endpoint"
  data/
    raw/ processed/ classified/ excluded/ exports/   (timestamped snapshots per stage, .json)
  docs/
    SCHEMA.md
  tests/
    test_dedup.py
```
