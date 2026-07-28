import { Link } from "react-router-dom";
import { ArrowRight, Layers, Network, FileStack } from "lucide-react";
import type { TopDomain } from "../../types";
import { getDomainStyle } from "../../lib/domainStyle";

export function DomainCard({ domain }: { domain: TopDomain }) {
  const style = getDomainStyle(domain.id);
  const Icon = style.icon;

  return (
    <Link
      to={`/taxonomy/${domain.id}`}
      className="group flex h-[300px] w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${style.gradient}`}>
          <Icon size={18} />
        </div>
        <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide ${style.chip}`}>
          {domain.id}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {domain.name}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {domain.definition}
      </p>

      <div className="mt-3 flex items-center gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <Layers size={13} /> {domain.domain_count} groups
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Network size={13} /> {domain.subdomain_count} concepts
        </span>
        {domain.paper_count > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <FileStack size={13} /> {domain.paper_count} paper{domain.paper_count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-700 group-hover:text-icaire-700 dark:text-zinc-300 dark:group-hover:text-icaire-400">
          Explore domain
        </span>
        <span className="grid size-7 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition-all group-hover:border-icaire-300 group-hover:bg-icaire-50 group-hover:text-icaire-700 dark:border-zinc-700 dark:text-zinc-400 dark:group-hover:border-icaire-700 dark:group-hover:bg-icaire-950/40 dark:group-hover:text-icaire-400">
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
