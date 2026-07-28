"""
The canonical paper record schema. Every stage after discovery reads/writes
records shaped exactly like `Record`. See docs/SCHEMA.md for the field-level
documentation intended for a frontend consumer.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any

# Distinct, closed set of review statuses. `needs_review` is the human-review
# queue required by the spec; it is a status, not a boolean flag, so it can
# later grow more values (e.g. "in_review", "rejected_by_reviewer") without a
# schema change.
REVIEW_STATUS_CLASSIFIED = "classified"      # confidently assigned to >=1 domain
REVIEW_STATUS_NEEDS_REVIEW = "needs_review"  # low confidence, awaiting a human
REVIEW_STATUS_EXCLUDED = "excluded"          # LLM/embeddings agree it matches no domain

VALID_REVIEW_STATUSES = {
    REVIEW_STATUS_CLASSIFIED,
    REVIEW_STATUS_NEEDS_REVIEW,
    REVIEW_STATUS_EXCLUDED,
}


def make_record_id(doi: str | None, title: str, source: str) -> str:
    """Stable id derived from DOI when available, else source+title hash."""
    basis = doi.strip().lower() if doi else f"{source}::{title.strip().lower()}"
    return hashlib.sha1(basis.encode("utf-8")).hexdigest()[:16]


@dataclass
class Record:
    id: str
    title: str
    authors_first2: list[str]
    author_count: int
    link: str | None
    doi: str | None
    source: str  # which discovery API found it: arxiv | semantic_scholar | openalex | crossref
    publish_date: str | None  # ISO date string, YYYY-MM-DD (or YYYY / YYYY-MM if that's all the source gives)
    abstract: str | None
    ai_summary: str | None = None
    domains: list[str] = field(default_factory=list)          # top-domain ids, e.g. ["TD1", "TD4"]
    subdomains: list[str] = field(default_factory=list)       # mid-tier domain/subdomain names
    confidence: float = 0.0                                    # 0-1, max confidence across assigned domains
    rationale: str | None = None                                # short LLM-authored justification
    taxonomy_version: str = "v2"
    review_status: str = REVIEW_STATUS_NEEDS_REVIEW
    date_added: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @staticmethod
    def from_dict(d: dict[str, Any]) -> "Record":
        return Record(**d)
