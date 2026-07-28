# Taxonomy v2 — 7-Domain Grouping Rationale

Source: `taxonomy_completed_unified.xlsx` (sheet "Unified Taxonomy", 15 domains / 286 subdomain rows).

This document explains why each of the 15 unified domains was grouped into one of 7 top-level domains. The grouping is conceptual, not arithmetic — each pair/triad was merged because the two (or three) domains answer the same underlying question about an AI system from two complementary angles, not because 15 needed to become 7.

## TD1 — Human Rights, Fairness & Dignity

**Definition:** Whether an AI system respects the fundamental rights, dignity, and equal treatment of the people and groups it affects. Covers both the foundational rights/democratic-values register (non-discrimination, dignity, rule of law as legal and political principles) and its operational counterpart in bias mitigation, accessibility, and inclusive treatment of protected groups.

**Member domains (15-tier):** Human Rights, Dignity & Democratic Values, Fairness, Diversity & Inclusion

**Subdomain count:** 38

**Why these belong together:** Both source domains ask the same root question — does this system treat people justly and respect who they are — from two angles: 'Human Rights, Dignity & Democratic Values' frames it as a rights/legal obligation, while 'Fairness, Diversity & Inclusion' frames it as a measurable bias/equity problem (e.g. bias prevention, equitable access, protected-attribute inference). They are the normative and operational halves of one concern.

## TD2 — Privacy, Transparency & Explainability

**Definition:** An individual's or the public's ability to know about, understand, and control how an AI system collects and uses their information and reaches its decisions. Spans data protection/confidentiality (what the system knows and how it's obtained) and system legibility (how the system's behaviour and outputs can be explained, traced, and disclosed as AI-generated).

**Member domains (15-tier):** Privacy & Data Protection, Transparency, Explainability & Traceability

**Subdomain count:** 41

**Why these belong together:** Privacy and transparency are both about controlling information flow around the system, just in opposite directions: privacy restricts what information flows *into* the system and out to others; transparency/explainability governs what information flows *out* about how the system works. Many original subdomains blur the two already (e.g. 'awareness of AI interaction', 'confidential data in prompt'), so treating them as one informational-control cluster is a genuine, not arbitrary, merge.

## TD3 — Security, Resilience & Technical Integrity

**Definition:** The technical robustness of AI systems and their supply chains against attack, tampering, and failure. Covers adversarial/security threats (attacks, vulnerabilities, resilience under abuse) together with the integrity of the data, models, and components feeding the system (poisoning, contamination, provenance of training data and model artifacts).

**Member domains (15-tier):** Security, Resilience & Technical Abuse, Data, Model & Supply-Chain Integrity

**Subdomain count:** 62

**Why these belong together:** Both are 'defend the technical pipeline from compromise' concerns — one from an external attacker's perspective (security/resilience), the other from a corrupted-input/corrupted-component perspective (data/model/supply-chain integrity). Data and model poisoning is itself a named attack vector in the security literature, so the two domains already overlap mechanically, not just thematically.

## TD4 — Safety, Alignment & Human Oversight

**Definition:** Whether an AI system behaves reliably, stays aligned with the values and intentions of its operators and users, and remains under meaningful human understanding and control. Covers system-level reliability/alignment (accuracy, dangerous capabilities, value alignment) together with the human-agency question of who retains the ability to intervene, consent, and override.

**Member domains (15-tier):** Safety, Reliability & Value Alignment, Human Agency, Autonomy & Oversight

**Subdomain count:** 48

**Why these belong together:** A system cannot be judged 'safe' independent of whether a human can still understand, interrupt, and correct it — the source frameworks pair these ideas constantly (e.g. 'excessive agency' and 'excessive autonomy' as risks sit right alongside reliability and value-alignment risks in the same frameworks). Reliability is the engineering half; human oversight is the control-authority half of the same failure mode: an unsafe, unaligned, or unsupervised system.

## TD5 — Accountability, Governance & Legal Rights

**Definition:** The organizational, regulatory, and legal structures that assign responsibility for an AI system's behaviour and outcomes. Covers governance/risk-management process (audits, accountability structures, actor responsibility, risk management) together with the legal-rights regime that governs what may lawfully be done with data, models, and outputs (copyright, data-acquisition and transfer restrictions).

**Member domains (15-tier):** Accountability, Governance & Risk Management, Intellectual Property & Legal Rights

**Subdomain count:** 40

**Why these belong together:** Both are 'who is answerable, and under what rulebook' concerns rather than questions about the system's technical behaviour. Governance defines internal accountability structures; IP/legal rights define the external legal constraints those structures must operate inside — the two together form the full accountability envelope (internal responsibility + external law) around an AI system.

## TD6 — Societal, Economic & Environmental Impact

**Definition:** AI's broad, often diffuse downstream effects on people, economies, and the planet, beyond the behaviour of any single system. Covers beneficence and well-being (does AI actively promote human flourishing and social good), socioeconomic effects (labour markets, access to essential services, democratic processes), and environmental impact (energy and resource use, environmental harm).

**Member domains (15-tier):** Beneficence, Well-being & Social Good, Socioeconomic & Societal Impact, Sustainability & Environmental Impact

**Subdomain count:** 35

**Why these belong together:** These three source domains are the only ones in the taxonomy that are not about a system's internal behaviour at all — they are about externalities AI produces on society, the economy, and the environment at large. They scale at the level of populations and ecosystems rather than individual users, which is what separates this cluster from, e.g., the individual-rights cluster in TD1.

## TD7 — Information & Content Integrity

**Definition:** The integrity of information and content that AI systems produce or propagate. Covers unintentional harms to the information ecosystem (disinformation, factual inaccuracy) together with intentional misuse — manipulation, deepfakes, and generation of harmful or dangerous content.

**Member domains (15-tier):** Information Integrity & Misinformation, Misuse, Manipulation & Harmful Content

**Subdomain count:** 22

**Why these belong together:** Both domains are about AI corrupting the information ecosystem; the only difference is intent — misinformation is the unintentional/systemic failure mode, misuse/manipulation is the deliberate one. Distinguishing them further would require judging intent, which the source frameworks themselves don't cleanly separate (e.g. deepfakes appear as both a disinformation and a misuse concern across frameworks), so keeping them as one top domain avoids an artificial split.
