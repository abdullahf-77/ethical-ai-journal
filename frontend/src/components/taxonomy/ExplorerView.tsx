import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, FileText, ArrowUpRight } from "lucide-react";
import type { TopDomain, Paper } from "../../types";
import { papersForSubdomain } from "../../lib/papersFor";

const EASE = [0.16, 1, 0.3, 1] as const;

// Master-detail alternative to the domain card grid: a persistent domain
// list on the left, a single detail panel on the right. Switching domains
// never navigates or reflows the page — only the right panel content
// crossfades in place. Reuses the same taxonomy/papers data and paper-row
// treatment as DomainTreePanel so both views always agree with each other.
export function ExplorerView({ domains, papers }: { domains: TopDomain[]; papers: Paper[] }) {
  const [activeId, setActiveId] = useState<string | null>(domains[0]?.id ?? null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const active = domains.find((d) => d.id === activeId) ?? domains[0] ?? null;

  const subdomains = useMemo(() => {
    if (!active) return [];
    return active.domains
      .flatMap((mid) => mid.subdomains)
      .map((sub) => ({ sub, papers: papersForSubdomain(sub.name, papers) }));
  }, [active, papers]);

  const paperCount = useMemo(
    () => new Set(subdomains.flatMap(({ papers: related }) => related.map((p) => p.id))).size,
    [subdomains],
  );

  const selectDomain = (id: string) => {
    setActiveId(id);
    setOpenSlug(null);
  };

  if (!active) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
      {/* Mobile / tablet: horizontal scrollable domain selector */}
      <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
        {domains.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => selectDomain(d.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              d.id === active.id
                ? "border-icaire-500 bg-icaire-500/10 text-icaire-700 dark:text-icaire-300"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Desktop: vertical domain navigator */}
      <nav aria-label="Domains" className="hidden lg:block">
        <ul className="space-y-0.5 border-l border-zinc-200 dark:border-zinc-800">
          {domains.map((d) => {
            const isActive = d.id === active.id;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => selectDomain(d.id)}
                  aria-current={isActive}
                  className={`-ml-px block w-full border-l-2 py-2.5 pl-4 pr-2 text-left text-sm transition-colors ${
                    isActive
                      ? "border-icaire-600 font-semibold text-icaire-700 dark:border-icaire-400 dark:text-icaire-300"
                      : "border-transparent font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
                  }`}
                >
                  {d.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Domain detail panel */}
      <div className="min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {active.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {active.definition}
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              {subdomains.length} Subdomain{subdomains.length === 1 ? "" : "s"} &middot; {paperCount} Paper
              {paperCount === 1 ? "" : "s"}
            </p>

            <ul className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-800">
              {subdomains.map(({ sub, papers: related }) => {
                const open = openSlug === sub.slug;
                const hasPapers = related.length > 0;
                return (
                  <li key={sub.slug}>
                    <button
                      type="button"
                      disabled={!hasPapers}
                      onClick={() => setOpenSlug(open ? null : sub.slug)}
                      aria-expanded={open}
                      className={`flex w-full items-center justify-between gap-3 py-3 text-left text-sm transition-colors ${
                        hasPapers
                          ? "text-zinc-700 hover:text-icaire-700 dark:text-zinc-300 dark:hover:text-icaire-400"
                          : "cursor-default text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden
                          className={`size-1.5 shrink-0 rounded-full ${
                            hasPapers ? "bg-icaire-500" : "bg-zinc-300 dark:bg-zinc-700"
                          }`}
                        />
                        <span className="truncate">{sub.name}</span>
                      </span>
                      {hasPapers && (
                        <motion.span
                          animate={{ rotate: open ? 90 : 0 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="shrink-0 text-zinc-400 dark:text-zinc-500"
                        >
                          <ChevronRight size={14} />
                        </motion.span>
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <ul className="space-y-0.5 py-1 pb-3 pl-4">
                            {related.map((paper) => (
                              <li key={paper.id}>
                                {paper.link ? (
                                  <a
                                    href={paper.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/paper flex items-start gap-1.5 rounded-lg px-1.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-icaire-50 hover:text-icaire-700 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-icaire-400"
                                  >
                                    <FileText size={12} className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                                    <span className="min-w-0 flex-1">{paper.title}</span>
                                    <ArrowUpRight
                                      size={11}
                                      className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover/paper:opacity-100"
                                    />
                                  </a>
                                ) : (
                                  <span className="flex items-start gap-1.5 rounded-lg px-1.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                    <FileText size={12} className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                                    <span className="min-w-0 flex-1">{paper.title}</span>
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
