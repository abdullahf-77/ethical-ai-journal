"""
OpenAlex discovery source. Free, keyless API (a `mailto` param opts into the
faster "polite pool"). Docs: https://docs.openalex.org/api-entities/works
Verified live 2026-07-23: GET https://api.openalex.org/works?search=...
returns {results:[{id, doi, title, publication_date, authorships,
abstract_inverted_index, primary_location, ...}]}. Abstracts are returned as
an inverted index (word -> [positions]) and must be reconstructed.
"""

from __future__ import annotations

import requests

from config import settings
from pipeline.discovery.base import build_record
from pipeline.storage.schema import Record

BASE_URL = "https://api.openalex.org/works"
SOURCE_NAME = "openalex"


def _reconstruct_abstract(inverted_index: dict[str, list[int]] | None) -> str | None:
    if not inverted_index:
        return None
    position_word: dict[int, str] = {}
    for word, positions in inverted_index.items():
        for pos in positions:
            position_word[pos] = word
    if not position_word:
        return None
    return " ".join(position_word[i] for i in sorted(position_word))


def search(query: str, max_results: int = 15) -> list[Record]:
    headers = {"User-Agent": settings.USER_AGENT}
    params = {
        "search": query,
        "per-page": max_results,
        "mailto": settings.CONTACT_EMAIL,
    }
    resp = requests.get(BASE_URL, params=params, headers=headers, timeout=30)
    resp.raise_for_status()

    results = resp.json().get("results", [])
    records: list[Record] = []
    for item in results:
        authors = [
            (a.get("author") or {}).get("display_name", "")
            for a in (item.get("authorships") or [])
        ]
        primary_location = item.get("primary_location") or {}
        link = primary_location.get("landing_page_url") or item.get("id")
        doi = item.get("doi")
        if doi and doi.startswith("https://doi.org/"):
            doi = doi[len("https://doi.org/"):]

        records.append(
            build_record(
                title=item.get("title") or item.get("display_name") or "",
                authors=authors,
                link=link,
                doi=doi,
                source=SOURCE_NAME,
                publish_date=item.get("publication_date"),
                abstract=_reconstruct_abstract(item.get("abstract_inverted_index")),
            )
        )
    return records
