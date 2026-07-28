"""
LLM confirmation pass. Takes the embedding pre-filter's shortlist for a paper
and asks the LLM to make the final call: confirm/reject shortlisted
domains-subdomains, and — critically — the LLM is given the full set of 7
top-domain definitions and is explicitly allowed to add domains that were NOT
in the embedding shortlist or drop ones that were. Its decision is what gets
written to the final record; the embedding shortlist is only a starting
point, never the final answer.

Also produces, in the same call: a short `ai_summary` of the paper and a
`rationale` string explaining the classification decision.

Two backends share the same forced-structured-output schema (`_TOOL_SCHEMA`),
selected via `settings.LLM_PROVIDER` ("anthropic" uses tool-use with
tool_choice forced; "gemini" uses response_schema JSON-mode) — swap providers
via the LLM_PROVIDER env var, no code changes needed.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass

from config import settings
from pipeline.classification.embed import ShortlistMatch

_TOOL_NAME = "classify_paper"

_TOOL_SCHEMA = {
    "name": _TOOL_NAME,
    "description": "Record the final domain/subdomain classification for an academic paper against the AI-ethics taxonomy.",
    "input_schema": {
        "type": "object",
        "properties": {
            "relevant": {
                "type": "boolean",
                "description": "True if the paper substantively relates to at least one taxonomy domain; false if it should be excluded entirely.",
            },
            "domains": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Final list of top-domain ids (e.g. 'TD1', 'TD4') the paper belongs to. Empty if relevant is false.",
            },
            "subdomains": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Final list of specific subdomain names (from the candidates provided, or others you know belong under the chosen domains) the paper belongs to.",
            },
            "confidence": {
                "type": "number",
                "description": "Your confidence in this classification, from 0.0 (guessing) to 1.0 (certain).",
            },
            "rationale": {
                "type": "string",
                "description": "1-3 sentences explaining why these domains/subdomains were chosen (or why the paper was excluded).",
            },
            "ai_summary": {
                "type": "string",
                "description": "A 2-3 sentence neutral summary of what the paper is about, for a frontend reader who hasn't read the abstract.",
            },
        },
        "required": ["relevant", "domains", "subdomains", "confidence", "rationale", "ai_summary"],
    },
}


@dataclass
class LLMClassification:
    relevant: bool
    domains: list[str]
    subdomains: list[str]
    confidence: float
    rationale: str
    ai_summary: str
    shortlist_overwritten: bool = False  # True if the LLM's domains differ from the embedding shortlist's domains


def _load_top_domains(path=settings.TAXONOMY_JSON) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    return [{"id": td["id"], "name": td["name"], "definition": td["definition"]} for td in data["top_domains"]]


def _build_prompt(title: str, abstract: str | None, shortlist: list[ShortlistMatch], top_domains: list[dict]) -> str:
    domains_block = "\n".join(f"- {d['id']}: {d['name']} — {d['definition']}" for d in top_domains)

    shortlist_domains = sorted({m.target.top_domain_id for m in shortlist})
    candidates_block = "\n".join(
        f"- [{m.target.top_domain_id}] {m.target.domain} :: {m.target.subdomain} (embedding similarity {m.score:.2f})"
        for m in shortlist
        if m.target.level == "subdomain"
    ) or "(none passed the embedding similarity threshold)"

    return f"""You are classifying an academic paper against a 7-domain AI-ethics/governance taxonomy.

TOP DOMAINS (the only valid values for "domains"):
{domains_block}

PAPER:
Title: {title}
Abstract: {abstract or "(no abstract available)"}

An embedding-similarity pre-filter shortlisted these candidate subdomains as plausibly relevant (this is only a cheap starting point, NOT the answer — it can miss relevant domains or include irrelevant ones):
{candidates_block}

Shortlisted top domains: {", ".join(shortlist_domains) if shortlist_domains else "(none)"}

Your job: decide the paper's TRUE final classification.
- You may confirm, reject, or replace any shortlisted subdomain.
- You may assign domains/subdomains that were NOT in the shortlist at all, if the paper clearly belongs there based on the domain definitions above.
- If the paper is not substantively about any of the 7 domains (e.g. it's a pure ML systems/performance paper with no ethics/governance/societal angle), set relevant=false and leave domains/subdomains empty.
- A paper can legitimately belong to multiple domains and multiple subdomains (multi-label).

Provide your final decision as structured output matching the required schema."""


# Client instances are cheap but stateless-network-config objects; cache one
# per provider per process so classify_records() isn't re-authenticating on
# every paper in a run.
_client_cache: dict[str, object] = {}


def _get_anthropic_client():
    if "anthropic" not in _client_cache:
        import anthropic

        if not settings.ANTHROPIC_API_KEY:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set. Set it in your environment before running the classification stage."
            )
        _client_cache["anthropic"] = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client_cache["anthropic"]


def _get_gemini_client():
    if "gemini" not in _client_cache:
        from google import genai

        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Set it in your environment before running the classification stage."
            )
        _client_cache["gemini"] = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client_cache["gemini"]


def _call_anthropic(prompt: str, client, model: str) -> dict:
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        tools=[_TOOL_SCHEMA],
        tool_choice={"type": "tool", "name": _TOOL_NAME},
        messages=[{"role": "user", "content": prompt}],
    )
    tool_use_block = next(b for b in response.content if b.type == "tool_use")
    return tool_use_block.input


def _call_gemini(prompt: str, client, model: str) -> dict:
    from google.genai import errors as genai_errors
    from google.genai import types as genai_types

    config = genai_types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=_TOOL_SCHEMA["input_schema"],
    )

    # Gemini free-tier per-model RPM quotas can be tight (seen as low as
    # 5/min); back off and retry a few times before giving up on this paper,
    # same pattern as pipeline/discovery/semantic_scholar_source.py.
    backoffs = [15, 30, 60]
    for attempt, wait in enumerate([0] + backoffs):
        if wait:
            time.sleep(wait)
        try:
            response = client.models.generate_content(model=model, contents=prompt, config=config)
            return json.loads(response.text)
        except genai_errors.ClientError as exc:
            if exc.code == 429 and attempt < len(backoffs):
                continue
            raise


_BACKENDS = {
    "anthropic": (_get_anthropic_client, _call_anthropic),
    "gemini": (_get_gemini_client, _call_gemini),
}


def classify_with_llm(
    title: str,
    abstract: str | None,
    shortlist: list[ShortlistMatch],
    client=None,
    model: str = settings.LLM_MODEL_NAME,
    provider: str | None = None,
) -> LLMClassification:
    provider = (provider or settings.LLM_PROVIDER).lower()
    if provider not in _BACKENDS:
        raise ValueError(f"Unknown LLM_PROVIDER {provider!r} (expected 'anthropic' or 'gemini')")
    get_client, call = _BACKENDS[provider]

    if client is None:
        client = get_client()

    top_domains = _load_top_domains()
    prompt = _build_prompt(title, abstract, shortlist, top_domains)
    result = call(prompt, client, model)

    shortlist_domains = {m.target.top_domain_id for m in shortlist}
    final_domains = set(result.get("domains") or [])
    overwritten = final_domains != shortlist_domains

    return LLMClassification(
        relevant=bool(result.get("relevant")),
        domains=sorted(final_domains),
        subdomains=list(result.get("subdomains") or []),
        confidence=float(result.get("confidence", 0.0)),
        rationale=(result.get("rationale") or "").strip(),
        ai_summary=(result.get("ai_summary") or "").strip(),
        shortlist_overwritten=overwritten,
    )
