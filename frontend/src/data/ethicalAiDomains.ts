// Frontend-only taxonomy data for the Taxonomy page's planetary visualization.
//
// This is intentionally decoupled from the Paper Sourcing Pipeline output
// (../data/taxonomy.json, ../data/papers.json). The pipeline still targets
// the previous 7-domain taxonomy; this file defines the new 10-domain
// taxonomy shown on the Taxonomy page until the pipeline is updated to
// match. Do not import pipeline data here.
//
// The ten titles below are the UNESCO principles and must be rendered
// verbatim wherever they appear. Do not shorten, paraphrase, rename, merge,
// or reword them, and do not add abbreviated display variants — every
// surface shows `title` exactly as written here.
//
// All ten domains share one unified visual style (see PlanetOrb.tsx) —
// the same orb used in the Hero — rather than a distinct color per domain,
// so there is no per-domain color data here.

export interface EthicalAiDomain {
  id: number;
  /** Display order, e.g. "01" */
  number: string;
  /** Full official UNESCO principle title. Always displayed verbatim. */
  title: string;
  description: string;
}

export const ethicalAiDomains: EthicalAiDomain[] = [
  {
    id: 1,
    number: "01",
    title: "Proportionality and Do No Harm",
    description:
      "AI systems should not exceed what is necessary to achieve a legitimate aim, and must avoid causing harm to individuals, societies, and the environment.",
  },
  {
    id: 2,
    number: "02",
    title: "Safety and Security",
    description:
      "AI systems must operate safely and securely throughout their lifecycle, minimizing risks of unintended harm, misuse, or exploitation.",
  },
  {
    id: 3,
    number: "03",
    title: "Right to Privacy and Data Protection",
    description:
      "The design and deployment of AI must uphold individuals' privacy, including robust data protection safeguards and meaningful consent.",
  },
  {
    id: 4,
    number: "04",
    title: "Multi-stakeholder and Adaptive Governance and Collaboration",
    description:
      "Effective AI governance requires inclusive participation from governments, industry, academia, and civil society, adapting as the technology evolves.",
  },
  {
    id: 5,
    number: "05",
    title: "Responsibility and Accountability",
    description:
      "Clear lines of responsibility must exist for the outcomes of AI systems, with mechanisms to hold developers, deployers, and operators to account.",
  },
  {
    id: 6,
    number: "06",
    title: "Transparency and Explainability",
    description:
      "The workings and decisions of AI systems should be understandable and open to scrutiny by those they affect.",
  },
  {
    id: 7,
    number: "07",
    title: "Human Oversight and Determination",
    description:
      "People should retain the ability to oversee, intervene in, and ultimately decide on the use of AI systems, especially in consequential decisions.",
  },
  {
    id: 8,
    number: "08",
    title: "Sustainability",
    description:
      "The development and use of AI should be assessed for its social, economic, and environmental impact in support of long-term sustainability.",
  },
  {
    id: 9,
    number: "09",
    title: "Awareness and Literacy",
    description:
      "Public understanding of AI — its capabilities, limitations, and implications — is essential to informed participation in its governance.",
  },
  {
    id: 10,
    number: "10",
    title: "Fairness and Non-discrimination",
    description:
      "AI systems must promote social justice and avoid perpetuating bias or discrimination against individuals or groups.",
  },
];
