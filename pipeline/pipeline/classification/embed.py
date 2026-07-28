"""
Embedding pre-filter: embeds each paper's title+abstract and each taxonomy
domain/subdomain definition (from taxonomy_v2_7domains.json), then uses
cosine similarity to cheaply shortlist candidate domains/subdomains per
paper before the (more expensive) LLM confirmation pass.

Multi-label by construction: every target above the threshold (up to
top_k) is kept, so a paper can shortlist against several domains/subdomains
at once.

Uses a local sentence-transformers model — no API key, runs offline.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from config import settings


@dataclass
class TaxonomyTarget:
    target_id: str          # e.g. "TD1" (domain-level) or "TD1::Fairness, Diversity & Inclusion::Bias prevention and mitigation"
    level: str               # "domain" | "subdomain"
    top_domain_id: str
    top_domain_name: str
    domain: str | None       # mid-tier (15) domain name, None for domain-level targets
    subdomain: str | None    # subdomain name, None for domain-level targets
    text: str                # text that gets embedded


@dataclass
class ShortlistMatch:
    target: TaxonomyTarget
    score: float


def load_taxonomy_targets(path=settings.TAXONOMY_JSON) -> list[TaxonomyTarget]:
    data = json.loads(path.read_text(encoding="utf-8"))
    targets: list[TaxonomyTarget] = []

    for td in data["top_domains"]:
        targets.append(
            TaxonomyTarget(
                target_id=td["id"],
                level="domain",
                top_domain_id=td["id"],
                top_domain_name=td["name"],
                domain=None,
                subdomain=None,
                text=f"{td['name']}. {td['definition']}",
            )
        )
        for domain in td["domains"]:
            for sub in domain["subdomains"]:
                targets.append(
                    TaxonomyTarget(
                        target_id=f"{td['id']}::{domain['name']}::{sub['name']}",
                        level="subdomain",
                        top_domain_id=td["id"],
                        top_domain_name=td["name"],
                        domain=domain["name"],
                        subdomain=sub["name"],
                        text=f"{sub['name']}. {sub['scope']}",
                    )
                )
    return targets


class EmbeddingIndex:
    """Loads the embedding model once and precomputes target embeddings.
    Reused across all papers in a run — the expensive part (model load +
    taxonomy embedding) happens exactly once."""

    def __init__(self, model_name: str = settings.EMBEDDING_MODEL_NAME, taxonomy_path=settings.TAXONOMY_JSON):
        self.model = SentenceTransformer(model_name)
        self.targets = load_taxonomy_targets(taxonomy_path)
        target_texts = [t.text for t in self.targets]
        self.target_embeddings = self.model.encode(
            target_texts, normalize_embeddings=True, show_progress_bar=False
        )

    def embed_paper(self, title: str, abstract: str | None) -> np.ndarray:
        text = title if not abstract else f"{title}. {abstract}"
        return self.model.encode([text], normalize_embeddings=True, show_progress_bar=False)[0]

    def shortlist(
        self,
        title: str,
        abstract: str | None,
        threshold: float = settings.EMBEDDING_SHORTLIST_THRESHOLD,
        top_k: int = settings.EMBEDDING_SHORTLIST_TOP_K,
    ) -> list[ShortlistMatch]:
        paper_vec = self.embed_paper(title, abstract)
        scores = self.target_embeddings @ paper_vec  # cosine similarity (vectors are normalized)

        matches = [
            ShortlistMatch(target=t, score=float(s))
            for t, s in zip(self.targets, scores)
            if s >= threshold
        ]
        matches.sort(key=lambda m: m.score, reverse=True)
        return matches[:top_k]
