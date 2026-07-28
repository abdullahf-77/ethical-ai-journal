import type { Taxonomy, Paper } from "../types";

/**
 * Relevance-ranked search across domains, subdomains, and papers.
 *
 * This is a lexical scorer (exact/prefix/substring/token-overlap across a
 * primary field and a lower-weighted secondary field) - not true semantic
 * search. It exists so the UI (grouped, ranked results instead of a plain
 * substring filter) is already built the way a real semantic backend would
 * feed it. To upgrade later: replace `scoreText` below with a lookup against
 * precomputed embedding similarity (the pipeline already embeds every paper
 * and every taxonomy target in `pipeline/classification/embed.py` - the
 * same vectors could be exported and queried client-side, or served by a
 * small API) while keeping `searchAll`'s signature and the
 * `GroupedSearchResults` shape identical, so no UI changes would be needed.
 */

export interface DomainResult {
  type: "domain";
  id: string;
  name: string;
  score: number;
}

export interface SubdomainResult {
  type: "subdomain";
  name: string;
  topDomainId: string;
  topDomainName: string;
  slug: string;
  score: number;
}

export interface PaperResult {
  type: "paper";
  id: string;
  title: string;
  authors: string;
  score: number;
}

export interface GroupedSearchResults {
  domains: DomainResult[];
  subdomains: SubdomainResult[];
  papers: PaperResult[];
}

const EMPTY: GroupedSearchResults = { domains: [], subdomains: [], papers: [] };

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

/** Scores how relevant `primary` (+ optional lower-weighted `secondary`)
 * text is to `query`. 0 means no match. Exact/prefix/substring matches on
 * the primary field rank far above token overlap in the secondary field, so
 * e.g. a title match always outranks an abstract mention. */
function scoreText(query: string, primary: string, secondary?: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const p = primary.toLowerCase();
  let score = 0;

  if (p === q) score += 100;
  else if (p.startsWith(q)) score += 60;
  else if (p.includes(q)) score += 40;

  const qTokens = tokenize(q);
  const pTokens = new Set(tokenize(primary));
  for (const t of qTokens) if (pTokens.has(t)) score += 15;

  if (secondary) {
    const s = secondary.toLowerCase();
    if (s.includes(q)) score += 10;
    const sTokens = new Set(tokenize(secondary));
    for (const t of qTokens) if (sTokens.has(t)) score += 4;
  }

  return score;
}

export function searchAll(
  query: string,
  taxonomy: Taxonomy,
  papers: Paper[],
  limitPerGroup = 5,
): GroupedSearchResults {
  if (!query.trim()) return EMPTY;

  const domains: DomainResult[] = [];
  const subdomains: SubdomainResult[] = [];

  for (const td of taxonomy.top_domains) {
    const dScore = scoreText(query, td.name, td.definition);
    if (dScore > 0) domains.push({ type: "domain", id: td.id, name: td.name, score: dScore });

    for (const mid of td.domains) {
      for (const sub of mid.subdomains) {
        const sScore = scoreText(query, sub.name, sub.scope);
        if (sScore > 0) {
          subdomains.push({
            type: "subdomain",
            name: sub.name,
            topDomainId: td.id,
            topDomainName: td.name,
            slug: sub.slug,
            score: sScore,
          });
        }
      }
    }
  }

  const paperResults: PaperResult[] = [];
  for (const p of papers) {
    const pScore = scoreText(query, p.title, p.abstract ?? undefined);
    if (pScore > 0) {
      paperResults.push({ type: "paper", id: p.id, title: p.title, authors: p.authors, score: pScore });
    }
  }

  const byScoreDesc = (a: { score: number }, b: { score: number }) => b.score - a.score;

  return {
    domains: domains.sort(byScoreDesc).slice(0, limitPerGroup),
    subdomains: subdomains.sort(byScoreDesc).slice(0, limitPerGroup),
    papers: paperResults.sort(byScoreDesc).slice(0, limitPerGroup),
  };
}
