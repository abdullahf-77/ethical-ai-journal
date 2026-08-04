import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Layers, Network, FileStack } from "lucide-react";
import type { TopDomain, Paper } from "../../types";
import { getDomainStyle } from "../../lib/domainStyle";
import { papersForSubdomain } from "../../lib/papersFor";

const EASE = [0.16, 1, 0.3, 1] as const;

export function DomainCard({
  domain,
  papers,
  selected,
  onToggle,
}: {
  domain: TopDomain;
  papers: Paper[];
  selected: boolean;
  onToggle: () => void;
}) {
  const style = getDomainStyle(domain.id);
  const Icon = style.icon;

  const { conceptCount, paperCount } = useMemo(() => {
    const subs = domain.domains.flatMap((mid) => mid.subdomains);
    const ids = new Set<string>();
    for (const sub of subs) for (const p of papersForSubdomain(sub.name, papers)) ids.add(p.id);
    return { conceptCount: subs.length, paperCount: ids.size };
  }, [domain, papers]);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={selected}
      aria-label={selected ? `Collapse ${domain.name}` : `Expand ${domain.name}`}
      className={`group flex h-[300px] w-full flex-col overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300 dark:bg-zinc-900/60 ${
        selected
          ? "border-icaire-400 shadow-xl shadow-icaire-600/10 ring-4 ring-icaire-500/10 dark:border-icaire-600 dark:ring-icaire-500/15"
          : "border-zinc-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:hover:shadow-black/20"
      }`}
    >
      <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${style.gradient}`}>
        <Icon size={18} />
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {domain.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {domain.definition}
      </p>

      <div className="mt-auto flex items-center gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <Layers size={13} /> {domain.domains.length} groups
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Network size={13} /> {conceptCount} concepts
        </span>
        {paperCount > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <FileStack size={13} /> {paperCount} paper{paperCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${
            selected
              ? "text-icaire-700 dark:text-icaire-400"
              : "text-zinc-700 group-hover:text-icaire-700 dark:text-zinc-300 dark:group-hover:text-icaire-400"
          }`}
        >
          {selected ? "Collapse domain" : "Explore domain"}
        </span>
        <span
          className={`grid size-7 place-items-center rounded-full border transition-all ${
            selected
              ? "border-icaire-300 bg-icaire-50 text-icaire-700 dark:border-icaire-700 dark:bg-icaire-950/40 dark:text-icaire-400"
              : "border-zinc-200 text-zinc-500 group-hover:border-icaire-300 group-hover:bg-icaire-50 group-hover:text-icaire-700 dark:border-zinc-700 dark:text-zinc-400 dark:group-hover:border-icaire-700 dark:group-hover:bg-icaire-950/40 dark:group-hover:text-icaire-400"
          }`}
        >
          <motion.span animate={{ rotate: selected ? 90 : 0 }} transition={{ duration: 0.2, ease: EASE }} className="flex">
            <ChevronRight size={14} />
          </motion.span>
        </span>
      </div>
    </button>
  );
}
