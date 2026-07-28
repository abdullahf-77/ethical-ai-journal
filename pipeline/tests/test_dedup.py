"""
Unit tests for the dedup stage. No network calls, no other pipeline stages —
pure Record-in, Record-out.

Run with: python -m pytest tests/test_dedup.py -v
     or:  python tests/test_dedup.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipeline.dedup.dedup import deduplicate, normalize_title, normalize_doi
from pipeline.storage.schema import Record, make_record_id


def _r(title, doi=None, source="test", abstract=None) -> Record:
    return Record(
        id=make_record_id(doi, title, source),
        title=title,
        authors_first2=["A. Author"],
        author_count=1,
        link="http://example.com",
        doi=doi,
        source=source,
        publish_date="2024-01-01",
        abstract=abstract,
    )


def test_normalize_title():
    assert normalize_title("  AI, Fairness & Bias!  ") == "ai fairness bias"
    assert normalize_title("A") != normalize_title("B")


def test_normalize_doi():
    assert normalize_doi("https://doi.org/10.1000/ABC") == "10.1000/abc"
    assert normalize_doi("10.1000/ABC ") == "10.1000/abc"
    assert normalize_doi(None) is None


def test_exact_doi_dedup():
    a = _r("Fairness in AI Systems", doi="10.1/xyz", source="arxiv")
    b = _r("Fairness in AI Systems (preprint)", doi="10.1/XYZ", source="openalex")
    unique, log = deduplicate([a, b])
    assert len(unique) == 1
    assert log[0].stage == "doi"


def test_exact_title_dedup_no_doi():
    a = _r("Explainable AI for Healthcare", doi=None, source="arxiv")
    b = _r("explainable ai for healthcare", doi=None, source="crossref")
    unique, log = deduplicate([a, b])
    assert len(unique) == 1
    assert log[0].stage == "normalized_title"


def test_fuzzy_title_dedup():
    a = _r("Large Language Models and Privacy Risks in Practice", doi=None, source="arxiv")
    b = _r("Large Language Models and Privacy Risks in Practice: A Study", doi=None, source="semantic_scholar")
    unique, log = deduplicate([a, b], fuzzy_threshold=85)
    assert len(unique) == 1
    assert log[0].stage == "fuzzy_title"


def test_distinct_papers_not_merged():
    a = _r("Deepfake Detection Using CNNs", doi="10.1/aaa", source="arxiv")
    b = _r("Supply Chain Attacks on ML Pipelines", doi="10.1/bbb", source="openalex")
    unique, log = deduplicate([a, b])
    assert len(unique) == 2
    assert log == []


def test_merge_fills_gaps():
    a = _r("Bias in Facial Recognition", doi="10.1/ccc", source="arxiv", abstract=None)
    b = _r("Bias in Facial Recognition", doi="10.1/ccc", source="openalex", abstract="An abstract.")
    unique, _ = deduplicate([a, b])
    assert len(unique) == 1
    assert unique[0].abstract == "An abstract."


def _run_all():
    tests = [v for k, v in globals().items() if k.startswith("test_")]
    passed = 0
    for t in tests:
        t()
        passed += 1
        print(f"  ok  {t.__name__}")
    print(f"\n{passed}/{len(tests)} dedup tests passed")


if __name__ == "__main__":
    _run_all()
