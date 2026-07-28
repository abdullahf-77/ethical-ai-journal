import { ArrowUpRight, Calendar, Users } from "lucide-react";
import type { Paper } from "../../types";
import { Reveal } from "../Reveal";

const SOURCE_LABEL: Record<string, string> = {
  arxiv: "arXiv",
  openalex: "OpenAlex",
  semantic_scholar: "Semantic Scholar",
  crossref: "Crossref",
};

const SOURCE_STYLE: Record<string, string> = {
  arxiv: "bg-red-500/10 text-red-600 dark:text-red-300",
  openalex: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  semantic_scholar: "bg-teal-500/10 text-teal-600 dark:text-teal-300",
  crossref: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
};

export function PaperCard({
  paper,
  delay = 0,
  compact = false,
}: {
  paper: Paper;
  delay?: number;
  compact?: boolean;
}) {
  const sourceLabel = SOURCE_LABEL[paper.source] ?? paper.source;
  const sourceStyle = SOURCE_STYLE[paper.source] ?? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300";

  return (
    <Reveal delay={delay}>
      <article
        className={`group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:shadow-black/20 ${
          compact ? "p-4" : "p-6"
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sourceStyle}`}>
            {sourceLabel}
          </span>
        </div>

        <h3 className={`line-clamp-3 font-semibold leading-snug text-zinc-900 dark:text-zinc-50 ${compact ? "text-sm" : "text-base"}`}>
          {paper.title}
        </h3>

        <div className={`flex-1 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 ${compact ? "mt-2.5" : "mt-4 text-sm"}`}>
          <p className="flex items-start gap-2">
            <Users size={13} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{paper.authors}</span>
          </p>
          {paper.year && (
            <p className="flex items-center gap-2">
              <Calendar size={13} className="shrink-0" />
              {paper.year}
            </p>
          )}
        </div>

        {paper.link ? (
          <a
            href={paper.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-icaire-600 text-xs font-semibold text-white transition-all hover:scale-[1.04] hover:bg-icaire-700 active:scale-[0.97] dark:bg-icaire-500 dark:hover:bg-icaire-400 ${
              compact ? "mt-4 px-3.5 py-1.5" : "mt-6 px-4 py-2"
            }`}
          >
            Read Paper
            <ArrowUpRight size={13} />
          </a>
        ) : (
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 ${
              compact ? "mt-4 px-3.5 py-1.5" : "mt-6 px-4 py-2"
            }`}
          >
            Link unavailable
          </span>
        )}
      </article>
    </Reveal>
  );
}
