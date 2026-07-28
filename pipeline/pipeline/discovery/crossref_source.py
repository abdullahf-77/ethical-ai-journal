"""
Crossref discovery source. Free, keyless API (a `mailto` param opts into the
faster "polite pool"). Docs: https://api.crossref.org/swagger-ui/index.html
Verified live 2026-07-23: GET https://api.crossref.org/works?query=...
returns {message: {items: [{DOI, title, author, issued/published,
container-title, URL, abstract, ...}]}}. `abstract`, when present, is
JATS-tagged XML (e.g. "<jats:p>...</jats:p>") and must be stripped.
"""

from __future__ import annotations

import re

import requests

from config import settings
from pipeline.discovery.base import build_record, normalize_date
from pipeline.storage.schema import Record

BASE_URL = "https://api.crossref.org/works"
SOURCE_NAME = "crossref"

_TAG_RE = re.compile(r"<[^>]+>")


def _strip_jats(abstract: str | None) -> str | None:
    if not abstract:
        return None
    return _TAG_RE.sub("", abstract).strip() or None


def search(query: str, max_results: int = 15) -> list[Record]:
    headers = {"User-Agent": settings.USER_AGENT}
    params = {
        "query": query,
        "rows": max_results,
        "mailto": settings.CONTACT_EMAIL,
        "select": "DOI,title,author,issued,published,published-print,container-title,URL,abstract,type",
    }
    resp = requests.get(BASE_URL, params=params, headers=headers, timeout=30)
    resp.raise_for_status()

    items = resp.json().get("message", {}).get("items", [])
    records: list[Record] = []
    for item in items:
        title_list = item.get("title") or []
        title = title_list[0] if title_list else ""
        if not title:
            continue  # skip non-article entries (e.g. ISBN-only book records) with no usable title

        authors = []
        for a in item.get("author") or []:
            name = " ".join(p for p in [a.get("given"), a.get("family")] if p)
            if name:
                authors.append(name)

        date_parts = None
        for key in ("published", "published-print", "issued"):
            block = item.get(key)
            if block and block.get("date-parts"):
                date_parts = block["date-parts"][0]
                break

        records.append(
            build_record(
                title=title,
                authors=authors,
                link=item.get("URL"),
                doi=item.get("DOI"),
                source=SOURCE_NAME,
                publish_date=normalize_date(date_parts),
                abstract=_strip_jats(item.get("abstract")),
            )
        )
    return records
