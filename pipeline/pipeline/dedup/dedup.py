"""
Three-stage deduplication, run in this fixed order:
    1. exact DOI match
    2. exact normalized-title match
    3. fuzzy title match (token_sort_ratio)

Deliberately dependency-free of the rest of the pipeline beyond the Record
schema, so it can be unit-tested in isolation (see tests/test_dedup.py) and
re-run on any list of Records independent of how they were discovered.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from rapidfuzz import fuzz

from config import settings
from pipeline.storage.schema import Record

_PUNCT_RE = re.compile(r"[^\w\s]")
_WS_RE = re.compile(r"\s+")


def normalize_title(title: str) -> str:
    title = title.lower()
    title = _PUNCT_RE.sub(" ", title)
    title = _WS_RE.sub(" ", title).strip()
    return title


def normalize_doi(doi: str | None) -> str | None:
    if not doi:
        return None
    doi = doi.strip().lower()
    doi = re.sub(r"^https?://(dx\.)?doi\.org/", "", doi)
    return doi or None


@dataclass
class DedupLogEntry:
    stage: str  # "doi" | "normalized_title" | "fuzzy_title"
    kept_id: str
    dropped_id: str
    kept_title: str
    dropped_title: str
    detail: str  # e.g. the fuzzy score, or "exact match"


def _merge_into(kept: Record, dropped: Record) -> Record:
    """Fill gaps in `kept` using non-null fields from `dropped`. Doesn't
    overwrite anything `kept` already has."""
    if not kept.doi and dropped.doi:
        kept.doi = dropped.doi
    if not kept.abstract and dropped.abstract:
        kept.abstract = dropped.abstract
    if not kept.link and dropped.link:
        kept.link = dropped.link
    if not kept.publish_date and dropped.publish_date:
        kept.publish_date = dropped.publish_date
    if kept.author_count == 0 and dropped.author_count:
        kept.authors_first2 = dropped.authors_first2
        kept.author_count = dropped.author_count
    return kept


def _dedup_by_key(records: list[Record], key_fn, stage_name: str, log: list[DedupLogEntry]) -> list[Record]:
    kept_by_key: dict[str, Record] = {}
    order: list[str] = []
    for r in records:
        key = key_fn(r)
        if key is None:
            # no usable key at this stage -> passes through untouched
            kept_by_key[f"__nokey__{r.id}"] = r
            order.append(f"__nokey__{r.id}")
            continue
        if key not in kept_by_key:
            kept_by_key[key] = r
            order.append(key)
        else:
            existing = kept_by_key[key]
            log.append(
                DedupLogEntry(
                    stage=stage_name,
                    kept_id=existing.id,
                    dropped_id=r.id,
                    kept_title=existing.title,
                    dropped_title=r.title,
                    detail="exact match",
                )
            )
            kept_by_key[key] = _merge_into(existing, r)
    return [kept_by_key[k] for k in order]


def _dedup_fuzzy_title(records: list[Record], threshold: int, log: list[DedupLogEntry]) -> list[Record]:
    kept: list[Record] = []
    for r in records:
        norm = normalize_title(r.title)
        match = None
        best_score = 0
        for existing in kept:
            score = fuzz.token_sort_ratio(norm, normalize_title(existing.title))
            if score >= threshold and score > best_score:
                match = existing
                best_score = score
        if match is None:
            kept.append(r)
        else:
            log.append(
                DedupLogEntry(
                    stage="fuzzy_title",
                    kept_id=match.id,
                    dropped_id=r.id,
                    kept_title=match.title,
                    dropped_title=r.title,
                    detail=f"token_sort_ratio={best_score}",
                )
            )
            _merge_into(match, r)
    return kept


def deduplicate(
    records: list[Record],
    fuzzy_threshold: int = settings.FUZZY_TITLE_THRESHOLD,
) -> tuple[list[Record], list[DedupLogEntry]]:
    """Run all three dedup stages in order. Returns (unique_records, log)."""
    log: list[DedupLogEntry] = []

    stage1 = _dedup_by_key(records, lambda r: normalize_doi(r.doi), "doi", log)
    stage2 = _dedup_by_key(stage1, lambda r: normalize_title(r.title) or None, "normalized_title", log)
    stage3 = _dedup_fuzzy_title(stage2, fuzzy_threshold, log)

    return stage3, log
