export interface Subdomain {
  name: string;
  slug: string;
  scope: string;
  paper_count: number;
}

export interface Domain {
  name: string;
  subdomains: Subdomain[];
}

export interface TopDomain {
  id: string;
  name: string;
  definition: string;
  domain_count: number;
  subdomain_count: number;
  paper_count: number;
  domains: Domain[];
}

export interface Taxonomy {
  taxonomy_version: string;
  top_domains: TopDomain[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  source: string;
  link: string | null;
  confidence: number;
  subdomains: string[];
}
