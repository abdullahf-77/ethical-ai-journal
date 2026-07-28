"""
Classification stage orchestrator: embedding pre-filter -> LLM confirmation
-> final record fields. Splits the input into (classified_or_review,
excluded) for the storage stage.

The LLM's decision always wins over the embedding shortlist — see
llm_classify.classify_with_llm, which explicitly allows the LLM to add or
drop domains the embedding step proposed. `shortlist_overwritten` is kept on
the record's rationale text (not silently discarded) so it's auditable.
"""

from __future__ import annotations

import sys

from config import settings
from pipeline.classification.embed import EmbeddingIndex
from pipeline.classification.llm_classify import classify_with_llm
from pipeline.storage.schema import (
    Record,
    REVIEW_STATUS_CLASSIFIED,
    REVIEW_STATUS_NEEDS_REVIEW,
    REVIEW_STATUS_EXCLUDED,
)


def classify_records(
    records: list[Record],
    embedding_index: EmbeddingIndex | None = None,
    llm_client=None,
) -> tuple[list[Record], list[Record]]:
    """Classify every record in place and split into (kept, excluded).

    `kept` contains both review_status=classified and review_status=needs_review
    records (both are "relevant", just at different confidence). `excluded`
    contains records the LLM judged unrelated to all 7 domains, kept for audit.

    `llm_client` is optional and provider-specific (an `anthropic.Anthropic` or
    `google.genai.Client` instance) — leave it None to let classify_with_llm
    construct/cache the right one for `settings.LLM_PROVIDER`.
    """
    if embedding_index is None:
        embedding_index = EmbeddingIndex()

    kept: list[Record] = []
    excluded: list[Record] = []

    for i, record in enumerate(records, 1):
        try:
            shortlist = embedding_index.shortlist(record.title, record.abstract)
            result = classify_with_llm(record.title, record.abstract, shortlist, client=llm_client)
        except Exception as exc:  # noqa: BLE001 - one bad record shouldn't kill the whole batch
            print(f"[classify] error on record {record.id} ({record.title[:60]!r}): {exc}", file=sys.stderr)
            record.review_status = REVIEW_STATUS_NEEDS_REVIEW
            record.rationale = f"Classification failed: {exc}"
            record.taxonomy_version = settings.TAXONOMY_VERSION
            kept.append(record)
            continue

        record.taxonomy_version = settings.TAXONOMY_VERSION
        record.confidence = result.confidence
        rationale = result.rationale
        if result.shortlist_overwritten:
            rationale = f"{rationale} [LLM overrode embedding shortlist]"
        record.rationale = rationale
        record.ai_summary = result.ai_summary or record.abstract

        if not result.relevant or not result.domains:
            record.domains = []
            record.subdomains = []
            record.review_status = REVIEW_STATUS_EXCLUDED
            excluded.append(record)
        else:
            record.domains = result.domains
            record.subdomains = result.subdomains
            record.review_status = (
                REVIEW_STATUS_CLASSIFIED
                if result.confidence >= settings.REVIEW_CONFIDENCE_THRESHOLD
                else REVIEW_STATUS_NEEDS_REVIEW
            )
            kept.append(record)

        if i % 10 == 0 or i == len(records):
            print(f"[classify] {i}/{len(records)} records processed")

    return kept, excluded
