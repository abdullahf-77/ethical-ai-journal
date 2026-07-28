"""
Semantic Scholar discovery source. Free API, keyless (unauthenticated tier is
shared and rate-limited; set SEMANTIC_SCHOLAR_API_KEY for a higher personal
limit — optional). Docs: https://api.semanticscholar.org/api-docs/graph
Verified live 2026-07-23: GET /graph/v1/paper/search returns
{total, offset, next, data:[{paperId, externalIds, title, abstract, authors,
year, publicationDate, url, venue, openAccessPdf}]}.
"""

from __future__ import annotations

import os
import time

import requests

from config import settings
from pipeline.discovery.base import build_record
from pipeline.storage.schema import Record

BASE_URL = "https://api.semanticscholar.org/graph/v1/paper/search"
SOURCE_NAME = "semantic_scholar"
FIELDS = "title,abstract,authors,year,externalIds,venue,publicationDate,url"


def search(query: str, max_results: int = 15) -> list[Record]:
    headers = {"User-Agent": settings.USER_AGENT}
    api_key = os.environ.get("SEMANTIC_SCHOLAR_API_KEY")
    if api_key:
        headers["x-api-key"] = api_key

    params = {"query": query, "limit": max_results, "fields": FIELDS}

    # unauthenticated tier is a shared, aggressively rate-limited pool;
    # back off and retry a few times before giving up on this query
    backoffs = [3, 8, 15]
    resp = requests.get(BASE_URL, params=params, headers=headers, timeout=30)
    for wait in backoffs:
        if resp.status_code != 429:
            break
        time.sleep(wait)
        resp = requests.get(BASE_URL, params=params, headers=headers, timeout=30)
    resp.raise_for_status()

    data = resp.json().get("data", [])
    records: list[Record] = []
    for item in data:
        authors = [a.get("name", "") for a in (item.get("authors") or [])]
        external_ids = item.get("externalIds") or {}
        records.append(
            build_record(
                title=item.get("title") or "",
                authors=authors,
                link=item.get("url"),
                doi=external_ids.get("DOI"),
                source=SOURCE_NAME,
                publish_date=item.get("publicationDate") or (str(item.get("year")) if item.get("year") else None),
                abstract=item.get("abstract"),
            )
        )
    return records
