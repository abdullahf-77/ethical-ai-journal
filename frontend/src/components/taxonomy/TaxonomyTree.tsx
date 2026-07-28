import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, FileText, Calendar } from "lucide-react";
import type { Taxonomy, Paper } from "../../types";
import { getDomainStyle } from "../../lib/domainStyle";
import { papersForSubdomain } from "../../lib/papersFor";

const EASE = [0.16, 1, 0.3, 1] as const;

function CollapseBody({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TaxonomyTree({ taxonomy, papers }: { taxonomy: Taxonomy; papers: Paper[] }) {
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set());
  const [openSubdomains, setOpenSubdomains] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  };

  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {taxonomy.top_domains.map((td) => {
        const style = getDomainStyle(td.id);
        const Icon = style.icon;
        const domainOpen = openDomains.has(td.id);

        return (
          <div key={td.id} className="py-2">
            <div className="flex items-center gap-2 py-2">
              <button
                type="button"
                onClick={() => toggle(openDomains, setOpenDomains, td.id)}
                aria-label={domainOpen ? "Collapse domain" : "Expand domain"}
                aria-expanded={domainOpen}
                className="grid size-7 shrink-0 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <motion.span
                  animate={{ rotate: domainOpen ? 90 : 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="flex"
                >
                  <ChevronRight size={15} />
                </motion.span>
              </button>

              <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white ${style.gradient}`}>
                <Icon size={13} />
              </div>

              <Link
                to={`/taxonomy/${td.id}`}
                className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 hover:text-icaire-700 dark:text-zinc-50 dark:hover:text-icaire-400"
              >
                {td.name}
              </Link>

              <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                {td.subdomain_count} subdomains &middot; {td.paper_count} papers
              </span>
            </div>

            <CollapseBody open={domainOpen}>
              <div className="ml-9 space-y-1 border-l border-zinc-100 pb-2 pl-4 dark:border-zinc-800">
                {td.domains.flatMap((mid) => mid.subdomains).map((sub) => {
                  const key = `${td.id}::${sub.name}`;
                  const subOpen = openSubdomains.has(key);
                  const related = papersForSubdomain(sub.name, papers);
                  const hasPapers = related.length > 0;

                  return (
                    <div key={key}>
                      <button
                        type="button"
                        disabled={!hasPapers}
                        onClick={() => hasPapers && toggle(openSubdomains, setOpenSubdomains, key)}
                        aria-expanded={subOpen}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                          hasPapers
                            ? "text-zinc-600 hover:bg-zinc-50 hover:text-icaire-700 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-icaire-400"
                            : "cursor-default text-zinc-400 dark:text-zinc-600"
                        }`}
                      >
                        {hasPapers ? (
                          <motion.span
                            animate={{ rotate: subOpen ? 90 : 0 }}
                            transition={{ duration: 0.2, ease: EASE }}
                            className="flex shrink-0 text-zinc-400 dark:text-zinc-500"
                          >
                            <ChevronRight size={12} />
                          </motion.span>
                        ) : (
                          <span className="w-3 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1 truncate">{sub.name}</span>
                        <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                          {related.length > 0 ? `${related.length} papers` : "—"}
                        </span>
                      </button>

                      <CollapseBody open={subOpen}>
                        <div className="ml-5 space-y-0.5 border-l border-zinc-100 py-1 pl-4 dark:border-zinc-800">
                          {related.map((paper) => (
                            <Link
                              key={paper.id}
                              to={`/papers/${paper.id}`}
                              className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:bg-icaire-50 hover:text-icaire-700 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-icaire-400"
                            >
                              <FileText size={12} className="mt-0.5 shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="line-clamp-1 block text-zinc-700 dark:text-zinc-200">{paper.title}</span>
                                {paper.year && (
                                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                                    <Calendar size={10} /> {paper.year} &middot; {paper.source}
                                  </span>
                                )}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </CollapseBody>
                    </div>
                  );
                })}
              </div>
            </CollapseBody>
          </div>
        );
      })}
    </div>
  );
}
