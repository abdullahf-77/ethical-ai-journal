import { FileStack } from "lucide-react";
import type { Subdomain, Paper } from "../../types";
import { papersForSubdomain } from "../../lib/papersFor";
import { PaperCard } from "../papers/PaperCard";

export function SubdomainBlock({
  subdomain,
  papers,
}: {
  subdomain: Subdomain;
  papers: Paper[];
}) {
  const related = papersForSubdomain(subdomain.name, papers);

  return (
    <div id={subdomain.slug} className="scroll-mt-28 border-l-2 border-icaire-200 pl-5 dark:border-icaire-800/60 sm:pl-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{subdomain.name}</h4>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {subdomain.scope}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          <FileStack size={12} />
          {related.length > 0 ? `${related.length} paper${related.length === 1 ? "" : "s"}` : "No papers yet"}
        </span>
      </div>

      {related.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((paper) => (
            <PaperCard key={paper.id} paper={paper} compact />
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-3 text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-500">
          No papers indexed for this subdomain yet.
        </p>
      )}
    </div>
  );
}
