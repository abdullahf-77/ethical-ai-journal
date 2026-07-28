"""
Shared helpers for discovery source modules. Each source module (arxiv_source,
semantic_scholar_source, openalex_source, crossref_source) exposes a single
function:

    search(query: str, max_results: int) -> list[Record]

and is independently callable/testable — no shared mutable state between them.
"""

from __future__ import annotations

import re
from typing import Any

from pipeline.storage.schema import Record, make_record_id, REVIEW_STATUS_NEEDS_REVIEW


def split_authors(authors: list[str]) -> tuple[list[str], int]:
    authors = [a for a in authors if a]
    return authors[:2], len(authors)


def normalize_date(raw: Any) -> str | None:
    """Best-effort normalization to an ISO-ish date string. Accepts strings,
    (year, month, day) tuples/lists (Crossref's date-parts shape), or None."""
    if raw is None:
        return None
    if isinstance(raw, str):
        return raw[:10] if raw else None
    if isinstance(raw, (list, tuple)) and raw:
        parts = [str(p).zfill(2) if i > 0 else str(p) for i, p in enumerate(raw)]
        return "-".join(parts)
    return None


def clean_text(text: str | None) -> str | None:
    if not text:
        return None
    text = re.sub(r"\s+", " ", text).strip()
    return text or None


def build_record(
    *,
    title: str,
    authors: list[str],
    link: str | None,
    doi: str | None,
    source: str,
    publish_date: str | None,
    abstract: str | None,
) -> Record:
    title = clean_text(title) or "(untitled)"
    authors_first2, author_count = split_authors(authors)
    return Record(
        id=make_record_id(doi, title, source),
        title=title,
        authors_first2=authors_first2,
        author_count=author_count,
        link=link,
        doi=doi.lower().strip() if doi else None,
        source=source,
        publish_date=publish_date,
        abstract=clean_text(abstract),
        review_status=REVIEW_STATUS_NEEDS_REVIEW,
    )
