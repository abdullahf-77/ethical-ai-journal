import type { Paper } from "../types";

/** Other papers sharing at least one subdomain, ranked by how many
 * subdomains they share (then confidence), excluding the paper itself. */
export function getRelatedPapers(paper: Paper, allPapers: Paper[], limit = 4): Paper[] {
  const subs = new Set(paper.subdomains);
  return allPapers
    .filter((p) => p.id !== paper.id && p.subdomains.some((s) => subs.has(s)))
    .map((p) => ({
      paper: p,
      shared: p.subdomains.filter((s) => subs.has(s)).length,
    }))
    .sort((a, b) => b.shared - a.shared || b.paper.confidence - a.paper.confidence)
    .slice(0, limit)
    .map((x) => x.paper);
}
