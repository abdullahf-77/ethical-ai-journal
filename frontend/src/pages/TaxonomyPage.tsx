import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";
import taxonomyData from "../data/taxonomy.json";
import papersData from "../data/papers.json";
import type { Taxonomy, TopDomain, Paper } from "../types";
import { DomainCard } from "../components/taxonomy/DomainCard";
import { DomainTreePanel } from "../components/taxonomy/DomainTreePanel";
import { SearchFilterBar, type SortMode } from "../components/taxonomy/SearchFilterBar";
import { ExplorerView } from "../components/taxonomy/ExplorerView";
import { Reveal } from "../components/Reveal";
import { domainMatches, findSubdomainMatch } from "../lib/taxonomySearch";

type ViewMode = "cards" | "explorer";

const EASE = [0.16, 1, 0.3, 1] as const;

const taxonomy = taxonomyData as Taxonomy;
const papers = papersData as Paper[];

export function TaxonomyPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("default");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoOpenSlug, setAutoOpenSlug] = useState<string | undefined>(undefined);
  const panelRef = useRef<HTMLDivElement>(null);

  const visibleDomains = useMemo(() => {
    let list = taxonomy.top_domains.filter((d) => domainMatches(d, papers, query));
    if (sort === "papers") list = [...list].sort((a, b) => b.paper_count - a.paper_count);
    return list;
  }, [query, sort]);

  const selected = visibleDomains.find((d) => d.id === selectedId) ?? null;

  // If the search term lands on exactly one subdomain, jump straight to its
  // parent domain and pre-open that subdomain in the tree panel — no need to
  // manually open the domain card just to find the thing you searched for.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setAutoOpenSlug(undefined);
      return;
    }
    const matches = taxonomy.top_domains
      .map((d) => ({ domain: d, slug: findSubdomainMatch(d, q) }))
      .filter((m): m is { domain: TopDomain; slug: string } => Boolean(m.slug));
    if (matches.length === 1) {
      setSelectedId(matches[0].domain.id);
      setAutoOpenSlug(matches[0].slug);
    } else {
      setAutoOpenSlug(undefined);
    }
  }, [query]);

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
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "cards" ? (
          <motion.div
            key="cards-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
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
                              initialOpenSlug={autoOpenSlug}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="explorer-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="mx-auto max-w-7xl px-6 pt-6 sm:px-8"
          >
            <ExplorerView domains={visibleDomains} papers={papers} query={query} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
