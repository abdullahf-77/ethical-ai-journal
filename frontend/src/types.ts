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
  abstract: string | null;
  ai_summary: string | null;
  rationale: string | null;
  confidence: number;
  domains: string[];
  subdomains: string[];
}

export type CenterGroupId = "I" | "II" | "III" | "IV" | "Va" | "Vb";

export interface Center {
  id: string;
  group: CenterGroupId;
  country: string;
  /** ISO 3166-1 numeric code, matches world-atlas topojson feature `id`. */
  countryCode: string;
  city: string;
  lat: number;
  lng: number;
  name: string;
  focus: string;
  affiliation: string;
  website: string | null;
}

export interface CenterGroup {
  id: CenterGroupId;
  label: string;
  regionName: string;
  /** Full canonical member-country list for this group (ISO 3166-1 numeric codes), not just countries that have a center. */
  countryCodes: string[];
}
