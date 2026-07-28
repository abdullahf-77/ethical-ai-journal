import taxonomyData from "../data/taxonomy.json";
import type { Taxonomy, TopDomain } from "../types";

const taxonomy = taxonomyData as Taxonomy;

export function findDomainById(id: string): TopDomain | null {
  return taxonomy.top_domains.find((d) => d.id === id) ?? null;
}

export interface SubdomainLocation {
  topDomainId: string;
  topDomainName: string;
  slug: string;
}

/** Finds which top-domain a subdomain (by exact name) lives under, and its
 * anchor slug, so a subdomain name can be turned into a link to
 * `/taxonomy/{topDomainId}#{slug}`. */
export function findSubdomainLocation(subdomainName: string): SubdomainLocation | null {
  for (const td of taxonomy.top_domains) {
    for (const mid of td.domains) {
      const sub = mid.subdomains.find((s) => s.name === subdomainName);
      if (sub) {
        return { topDomainId: td.id, topDomainName: td.name, slug: sub.slug };
      }
    }
  }
  return null;
}
