import taxonomyData from "../data/taxonomy.json";
import type { Taxonomy, TopDomain } from "../types";

const taxonomy = taxonomyData as Taxonomy;

export function findDomainById(id: string): TopDomain | null {
  return taxonomy.top_domains.find((d) => d.id === id) ?? null;
}
