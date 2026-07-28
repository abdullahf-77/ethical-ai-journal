import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import taxonomyData from "../data/taxonomy.json";
import papersData from "../data/papers.json";
import type { Taxonomy, TopDomain, Paper } from "../types";
import { DomainCard } from "../components/taxonomy/DomainCard";
import { SearchFilterBar, type SortMode } from "../components/taxonomy/SearchFilterBar";
import { Reveal } from "../components/Reveal";

const taxonomy = taxonomyData as Taxonomy;
const papers = papersData as Paper[];

function domainMatches(domain: TopDomain, q: string): boolean {
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

export function TaxonomyPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("default");

  const visibleDomains = useMemo(() => {
    let list = taxonomy.top_domains.filter((d) => domainMatches(d, query));
    if (sort === "papers") list = [...list].sort((a, b) => b.paper_count - a.paper_count);
    if (sort === "subdomains") list = [...list].sort((a, b) => b.subdomain_count - a.subdomain_count);
    return list;
  }, [query, sort]);

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-14 sm:px-8 sm:pt-20">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
            Taxonomy Hub
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            The full landscape of AI ethics, organized
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            {taxonomy.top_domains.length} top-level domains, {taxonomy.top_domains.reduce((n, d) => n + d.domain_count, 0)} constituent
            areas, and {taxonomy.top_domains.reduce((n, d) => n + d.subdomain_count, 0)}+ subdomains —
            consolidated from twelve source frameworks. Open a domain to browse
            its subdomains and the papers indexed under each one.
          </p>
        </Reveal>
      </div>

      <div className="px-6 sm:px-8">
        <SearchFilterBar query={query} onQueryChange={setQuery} sort={sort} onSortChange={setSort} />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-10 sm:px-8">
        {visibleDomains.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-zinc-300 py-24 text-center dark:border-zinc-700">
            <SearchX size={28} className="text-zinc-400" />
            <p className="text-zinc-500 dark:text-zinc-400">
              No domains, subdomains, or papers match &ldquo;{query}&rdquo;. Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDomains.map((domain, i) => (
              <motion.div
                key={domain.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <DomainCard domain={domain} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
