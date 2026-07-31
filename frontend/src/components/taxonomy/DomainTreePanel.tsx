import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, FileText, ArrowUpRight, X } from "lucide-react";
import type { TopDomain, Paper } from "../../types";
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

export function DomainTreePanel({
  domain,
  papers,
  onClose,
}: {
  domain: TopDomain;
  papers: Paper[];
  onClose: () => void;
}) {
  const style = getDomainStyle(domain.id);
  const Icon = style.icon;
  const [openSubdomains, setOpenSubdomains] = useState<Set<string>>(new Set());

  // Flatten the intermediate group level and pair each subdomain with its
  // papers once, so counts stay in sync with the actual paper data.
  const subdomains = useMemo(
    () =>
      domain.domains
        .flatMap((mid) => mid.subdomains)
        .map((sub) => ({ sub, papers: papersForSubdomain(sub.name, papers) })),
    [domain, papers],
  );

  const paperCount = useMemo(
    () => new Set(subdomains.flatMap(({ papers: related }) => related.map((p) => p.id))).size,
    [subdomains],
  );

  const toggleSubdomain = (slug: string) => {
    setOpenSubdomains((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-icaire-400/60 bg-zinc-50/60 shadow-sm dark:border-icaire-700/60 dark:bg-zinc-900/40">
      <div className="flex items-center gap-3 border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800/70">
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md ${style.gradient}`}>
          <Icon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{domain.name}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {subdomains.length} subdomains &middot; {paperCount} paper{paperCount === 1 ? "" : "s"}
          </p>
        </div>
        <span className={`hidden rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide sm:inline ${style.chip}`}>
          {domain.id}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close domain tree"
          className="grid size-7 shrink-0 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-700/70 dark:hover:text-zinc-200"
        >
          <X size={15} />
        </button>
      </div>

      <div className="scrollbar-thin max-h-[28rem] overflow-y-auto p-5 pt-3">
        <ul className="space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-700">
          {subdomains.map(({ sub, papers: related }) => {
            const subOpen = openSubdomains.has(sub.slug);
            const hasPapers = related.length > 0;

            return (
              <li key={sub.slug} className="relative">
                <span aria-hidden className="absolute -left-3 top-[15px] h-px w-2.5 bg-zinc-200 dark:bg-zinc-700" />
                <button
                  type="button"
                  disabled={!hasPapers}
                  onClick={() => hasPapers && toggleSubdomain(sub.slug)}
                  aria-expanded={subOpen}
                  className={`flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left text-sm transition-colors ${
                    hasPapers
                      ? "text-zinc-600 hover:bg-zinc-100/80 hover:text-icaire-700 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-icaire-400"
                      : "cursor-default text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {hasPapers ? (
                    <motion.span
                      animate={{ rotate: subOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="flex shrink-0 text-zinc-400 dark:text-zinc-500"
                    >
                      <ChevronRight size={13} />
                    </motion.span>
                  ) : (
                    <span className="w-[13px] shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{sub.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                    ({related.length})
                  </span>
                </button>

                <CollapseBody open={subOpen}>
                  <ul className="ml-[7px] space-y-0.5 border-l border-zinc-200 py-1 pl-3 dark:border-zinc-700">
                    {related.map((paper) => (
                      <li key={paper.id} className="relative">
                        <span aria-hidden className="absolute -left-3 top-[14px] h-px w-2.5 bg-zinc-200 dark:bg-zinc-700" />
                        {paper.link ? (
                          <a
                            href={paper.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/paper flex items-start gap-1.5 rounded-lg px-1.5 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-icaire-50 hover:text-icaire-700 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-icaire-400"
                          >
                            <FileText size={12} className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                            <span className="min-w-0 flex-1">{paper.title}</span>
                            <ArrowUpRight size={11} className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover/paper:opacity-100" />
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
                </CollapseBody>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
