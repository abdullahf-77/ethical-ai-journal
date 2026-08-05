import type { TopDomain, Paper } from "../types";

// Shared between Cards View (TaxonomyPage) and Explorer View so both modes
// agree on what counts as a "match" for the same search query.
export function domainMatches(domain: TopDomain, papers: Paper[], q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  if (domain.name.toLowerCase().includes(needle) || domain.definition.toLowerCase().includes(needle)) {
    return true;
  }
  const subdomainNames = new Set<string>();
  const hasSubdomainMatch = domain.domains.some((mid) =>
    mid.subdomains.some((s) => {
      subdomainNames.add(s.name);
      return s.name.toLowerCase().includes(needle) || s.scope.toLowerCase().includes(needle);
    }),
  );
  if (hasSubdomainMatch) return true;

  return papers.some(
    (p) => p.subdomains.some((sd) => subdomainNames.has(sd)) && p.title.toLowerCase().includes(needle),
  );
}

// Finds the first subdomain within a domain whose name or scope matches the
// query, so a search that lands on a specific subdomain can jump straight to
// it instead of leaving the user to open the domain card themselves.
export function findSubdomainMatch(domain: TopDomain, q: string): string | undefined {
  const needle = q.toLowerCase();
  for (const mid of domain.domains) {
    for (const s of mid.subdomains) {
      if (s.name.toLowerCase().includes(needle) || s.scope.toLowerCase().includes(needle)) {
        return s.slug;
      }
    }
  }
  return undefined;
}
