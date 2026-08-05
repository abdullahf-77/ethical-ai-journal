// Frontend-only taxonomy data for the Taxonomy page's planetary visualization.
//
// This is intentionally decoupled from the Paper Sourcing Pipeline output
// (../data/taxonomy.json, ../data/papers.json). The pipeline still targets
// the previous 7-domain taxonomy; this file defines the new 10-domain
// taxonomy shown on the Taxonomy page until the pipeline is updated to
// match. Do not import pipeline data here.

export interface DomainColor {
  /** Gradient start (lighter/brighter) */
  from: string;
  /** Gradient end (deeper) */
  to: string;
  /** rgba string used for the planet's soft glow */
  glow: string;
}

export interface EthicalAiDomain {
  id: number;
  /** Display order, e.g. "01" */
  number: string;
  /** Full official domain title */
  title: string;
  /** Short label, broken into lines for display next to the planet */
  shortLabel: [string, string?];
  description: string;
  color: DomainColor;
}

export const ethicalAiDomains: EthicalAiDomain[] = [
  {
    id: 1,
    number: "01",
    title: "Proportionality and Do No Harm",
    shortLabel: ["Proportionality &", "Do No Harm"],
    description:
      "AI systems should not exceed what is necessary to achieve a legitimate aim, and must avoid causing harm to individuals, societies, and the environment.",
    color: { from: "#5B54E8", to: "#332E9E", glow: "rgba(91, 84, 232, 0.35)" },
  },
  {
    id: 2,
    number: "02",
    title: "Safety and Security",
    shortLabel: ["Safety &", "Security"],
    description:
      "AI systems must operate safely and securely throughout their lifecycle, minimizing risks of unintended harm, misuse, or exploitation.",
    color: { from: "#3E82EF", to: "#1E4FB8", glow: "rgba(62, 130, 239, 0.32)" },
  },
  {
    id: 3,
    number: "03",
    title: "Right to Privacy and Data Protection",
    shortLabel: ["Right to Privacy &", "Data Protection"],
    description:
      "The design and deployment of AI must uphold individuals' privacy, including robust data protection safeguards and meaningful consent.",
    color: { from: "#8B5CF6", to: "#5B2FAE", glow: "rgba(139, 92, 246, 0.32)" },
  },
  {
    id: 4,
    number: "04",
    title: "Multi-stakeholder and Adaptive Governance and Collaboration",
    shortLabel: ["Adaptive Governance &", "Collaboration"],
    description:
      "Effective AI governance requires inclusive participation from governments, industry, academia, and civil society, adapting as the technology evolves.",
    color: { from: "#6C6BF0", to: "#3F3BC2", glow: "rgba(108, 107, 240, 0.32)" },
  },
  {
    id: 5,
    number: "05",
    title: "Responsibility and Accountability",
    shortLabel: ["Responsibility &", "Accountability"],
    description:
      "Clear lines of responsibility must exist for the outcomes of AI systems, with mechanisms to hold developers, deployers, and operators to account.",
    color: { from: "#C6839C", to: "#95566E", glow: "rgba(198, 131, 156, 0.32)" },
  },
  {
    id: 6,
    number: "06",
    title: "Transparency and Explainability",
    shortLabel: ["Transparency &", "Explainability"],
    description:
      "The workings and decisions of AI systems should be understandable and open to scrutiny by those they affect.",
    color: { from: "#C24FCB", to: "#8B2E96", glow: "rgba(194, 79, 203, 0.32)" },
  },
  {
    id: 7,
    number: "07",
    title: "Human Oversight and Determination",
    shortLabel: ["Human Oversight &", "Determination"],
    description:
      "People should retain the ability to oversee, intervene in, and ultimately decide on the use of AI systems, especially in consequential decisions.",
    color: { from: "#EC8F4A", to: "#B85F1E", glow: "rgba(236, 143, 74, 0.32)" },
  },
  {
    id: 8,
    number: "08",
    title: "Sustainability",
    shortLabel: ["Sustainability"],
    description:
      "The development and use of AI should be assessed for its social, economic, and environmental impact in support of long-term sustainability.",
    color: { from: "#CB7A57", to: "#985838", glow: "rgba(203, 122, 87, 0.32)" },
  },
  {
    id: 9,
    number: "09",
    title: "Awareness and Literacy",
    shortLabel: ["Awareness &", "Literacy"],
    description:
      "Public understanding of AI — its capabilities, limitations, and implications — is essential to informed participation in its governance.",
    color: { from: "#C9A227", to: "#93781C", glow: "rgba(201, 162, 39, 0.32)" },
  },
  {
    id: 10,
    number: "10",
    title: "Fairness and Non-discrimination",
    shortLabel: ["Fairness &", "Non-discrimination"],
    description:
      "AI systems must promote social justice and avoid perpetuating bias or discrimination against individuals or groups.",
    color: { from: "#4CAF6D", to: "#2E7D4A", glow: "rgba(76, 175, 109, 0.32)" },
  },
];
