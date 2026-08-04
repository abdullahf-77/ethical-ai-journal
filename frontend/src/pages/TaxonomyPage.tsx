import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";
import taxonomyData from "../data/taxonomy.json";
import papersData from "../data/papers.json";
import type { Taxonomy, TopDomain, Paper } from "../types";
import { DomainCard } from "../components/taxonomy/DomainCard";
import { DomainTreePanel } from "../components/taxonomy/DomainTreePanel";
import { SearchFilterBar, type SortMode } from "../components/taxonomy/SearchFilterBar";
import { Reveal } from "../components/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const visibleDomains = useMemo(() => {
    let list = taxonomy.top_domains.filter((d) => domainMatches(d, query));
    if (sort === "papers") list = [...list].sort((a, b) => b.paper_count - a.paper_count);
    if (sort === "subdomains") list = [...list].sort((a, b) => b.subdomain_count - a.subdomain_count);
    return list;
  }, [query, sort]);

  const selected = visibleDomains.find((d) => d.id === selectedId) ?? null;

  // Scroll to the shared panel whenever a domain is selected or switched.
  // scroll-mt on the panel offsets the sticky navbar + search bar stack.
  useEffect(() => {
    if (!selectedId) return;
    const timer = setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedId]);

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-14 sm:px-8 sm:pt-20">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
            Taxonomy Hub
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            A living Taxonomy Hub for AI ethics
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            {taxonomy.top_domains.length} top-level domains, {taxonomy.top_domains.reduce((n, d) => n + d.domain_count, 0)} constituent
            areas, and {taxonomy.top_domains.reduce((n, d) => n + d.subdomain_count, 0)}+ subdomains —
            consolidated from twelve source frameworks. Select a domain card to
            browse its subdomains and the papers indexed under each one.
          </p>
        </Reveal>
      </div>

      <div className="px-6 sm:px-8">
        <SearchFilterBar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
        />
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
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDomains.map((domain, i) => (
                <motion.div
                  key={domain.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                >
                  <DomainCard
                    domain={domain}
                    papers={papers}
                    selected={domain.id === selectedId}
                    onToggle={() => setSelectedId((cur) => (cur === domain.id ? null : domain.id))}
                  />
                </motion.div>
              ))}
            </div>

            <div ref={panelRef} className="scroll-mt-[200px]">
              <AnimatePresence initial={false}>
                {selected && (
                  <motion.div
                    key="tree-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pt-5">
                      <DomainTreePanel
                        key={selected.id}
                        domain={selected}
                        papers={papers}
                        onClose={() => setSelectedId(null)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
