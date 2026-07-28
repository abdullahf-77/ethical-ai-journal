"""
Google Sheets storage backend — the source of truth for classified /
needs_review / excluded records.

Chosen over Airtable/Supabase because volume here is expected to stay in the
hundreds-to-low-thousands range (see README for the reasoning): Sheets is
free, needs no infrastructure to run, and — importantly for the human review
queue requirement — is directly editable by a non-engineer reviewer without
giving them API/DB access. If volume grows past the low-thousands or
concurrent-write conflicts become an issue, this module is the only place
that needs to change; swap it for a Postgres/Supabase-backed equivalent
implementing the same write_records/read_records interface.

domains/subdomains are real Python lists in the Record/JSON export (see
pipeline/storage/schema.py and json_export.py); a spreadsheet cell can't hold
a native array, so here they're serialized as JSON-array strings (e.g.
'["TD1", "TD4"]'), not semicolon-joined, and deserialized back into lists on
read.
"""

from __future__ import annotations

import json

import gspread
from google.oauth2.service_account import Credentials

from config import settings
from pipeline.storage.schema import Record

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

HEADERS = [
    "id", "title", "authors_first2", "author_count", "link", "doi", "source",
    "publish_date", "abstract", "ai_summary", "domains", "subdomains",
    "confidence", "rationale", "taxonomy_version", "review_status", "date_added",
]


def _get_client() -> gspread.Client:
    if not settings.GOOGLE_SERVICE_ACCOUNT_JSON:
        raise RuntimeError(
            "GOOGLE_SERVICE_ACCOUNT_JSON is not set. Point it at your Google service-account "
            "credentials JSON file before using the Sheets storage backend."
        )
    creds = Credentials.from_service_account_file(settings.GOOGLE_SERVICE_ACCOUNT_JSON, scopes=SCOPES)
    return gspread.authorize(creds)


def _record_to_row(r: Record) -> list:
    return [
        r.id,
        r.title,
        json.dumps(r.authors_first2, ensure_ascii=False),
        r.author_count,
        r.link or "",
        r.doi or "",
        r.source,
        r.publish_date or "",
        r.abstract or "",
        r.ai_summary or "",
        json.dumps(r.domains, ensure_ascii=False),
        json.dumps(r.subdomains, ensure_ascii=False),
        r.confidence,
        r.rationale or "",
        r.taxonomy_version,
        r.review_status,
        r.date_added,
    ]


def _row_to_record(row: dict) -> Record:
    def _loads(val, default):
        try:
            return json.loads(val) if val else default
        except json.JSONDecodeError:
            return default

    return Record(
        id=row["id"],
        title=row["title"],
        authors_first2=_loads(row.get("authors_first2"), []),
        author_count=int(row.get("author_count") or 0),
        link=row.get("link") or None,
        doi=row.get("doi") or None,
        source=row.get("source", ""),
        publish_date=row.get("publish_date") or None,
        abstract=row.get("abstract") or None,
        ai_summary=row.get("ai_summary") or None,
        domains=_loads(row.get("domains"), []),
        subdomains=_loads(row.get("subdomains"), []),
        confidence=float(row.get("confidence") or 0.0),
        rationale=row.get("rationale") or None,
        taxonomy_version=row.get("taxonomy_version", settings.TAXONOMY_VERSION),
        review_status=row.get("review_status", "needs_review"),
        date_added=row.get("date_added", ""),
    )


def _get_or_create_worksheet(spreadsheet: gspread.Spreadsheet, title: str) -> gspread.Worksheet:
    try:
        return spreadsheet.worksheet(title)
    except gspread.WorksheetNotFound:
        return spreadsheet.add_worksheet(title=title, rows=100, cols=len(HEADERS))


def write_records(records: list[Record], worksheet_title: str, spreadsheet_id: str = settings.GOOGLE_SHEET_ID) -> None:
    """Full overwrite of the given worksheet with the current record set.
    Simple and safe for a manually re-run pipeline; switch to an upsert-by-id
    strategy if this becomes a scheduled incremental job."""
    if not spreadsheet_id:
        raise RuntimeError("PIPELINE_GOOGLE_SHEET_ID is not set.")
    client = _get_client()
    spreadsheet = client.open_by_key(spreadsheet_id)
    ws = _get_or_create_worksheet(spreadsheet, worksheet_title)
    ws.clear()
    rows = [HEADERS] + [_record_to_row(r) for r in records]
    ws.update(values=rows, range_name="A1")


def read_records(worksheet_title: str, spreadsheet_id: str = settings.GOOGLE_SHEET_ID) -> list[Record]:
    if not spreadsheet_id:
        raise RuntimeError("PIPELINE_GOOGLE_SHEET_ID is not set.")
    client = _get_client()
    spreadsheet = client.open_by_key(spreadsheet_id)
    ws = spreadsheet.worksheet(worksheet_title)
    # UNFORMATTED_VALUE is required here: the default (FORMATTED_VALUE)
    # renders numbers using the spreadsheet's locale display format (e.g. a
    # non-US locale renders 0.98 as "0٫98" with an Arabic decimal separator),
    # which then fails float() below. Unformatted gives the real underlying value.
    rows = ws.get_all_records(value_render_option=gspread.utils.ValueRenderOption.unformatted)
    return [_row_to_record(row) for row in rows]
