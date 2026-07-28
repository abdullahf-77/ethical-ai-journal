"""
arXiv discovery source. Free, keyless API. Docs: https://info.arxiv.org/help/api/user-manual.html
Verified live 2026-07-23: GET http://export.arxiv.org/api/query returns an
Atom feed; search_query supports field-scoped boolean terms like
`all:word AND all:word2`.
"""

from __future__ import annotations

import xml.etree.ElementTree as ET

import requests

from config import settings
from pipeline.discovery.base import build_record
from pipeline.storage.schema import Record

BASE_URL = "http://export.arxiv.org/api/query"
ATOM_NS = {"a": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
SOURCE_NAME = "arxiv"


def _word_and_query(query: str) -> str:
    words = query.split()
    return " AND ".join(f"all:{w}" for w in words)


def search(query: str, max_results: int = 15) -> list[Record]:
    params = {
        "search_query": _word_and_query(query),
        "start": 0,
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending",
    }
    headers = {"User-Agent": settings.USER_AGENT}
    resp = requests.get(BASE_URL, params=params, headers=headers, timeout=30)
    resp.raise_for_status()

    root = ET.fromstring(resp.content)
    records: list[Record] = []
    for entry in root.findall("a:entry", ATOM_NS):
        title = (entry.findtext("a:title", default="", namespaces=ATOM_NS) or "").strip()
        summary = (entry.findtext("a:summary", default="", namespaces=ATOM_NS) or "").strip()
        published = (entry.findtext("a:published", default="", namespaces=ATOM_NS) or "").strip()
        link = entry.findtext("a:id", default="", namespaces=ATOM_NS)
        authors = [
            (a.findtext("a:name", default="", namespaces=ATOM_NS) or "").strip()
            for a in entry.findall("a:author", ATOM_NS)
        ]
        doi = entry.findtext("arxiv:doi", default=None, namespaces=ATOM_NS)

        records.append(
            build_record(
                title=title,
                authors=authors,
                link=link or None,
                doi=doi,
                source=SOURCE_NAME,
                publish_date=published[:10] if published else None,
                abstract=summary,
            )
        )
    return records
