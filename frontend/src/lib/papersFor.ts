import type { Paper } from "../types";

export function papersForSubdomain(subdomainName: string, papers: Paper[]): Paper[] {
  return papers.filter((p) => p.subdomains.includes(subdomainName));
}
