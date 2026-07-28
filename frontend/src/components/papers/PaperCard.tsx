import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, Users } from "lucide-react";
import type { Paper } from "../../types";
import { Reveal } from "../Reveal";
import { sourceLabel, sourceStyle } from "../../lib/sourceStyle";

export function PaperCard({
  paper,
  delay = 0,
  compact = false,
}: {
  paper: Paper;
  delay?: number;
  compact?: boolean;
}) {
  return (
    <Reveal delay={delay}>
      <article
        className={`group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:shadow-black/20 ${
          compact ? "p-4" : "p-6"
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sourceStyle(paper.source)}`}>
            {sourceLabel(paper.source)}
          </span>
        </div>

        <Link to={`/papers/${paper.id}`} className="block">
          <h3 className={`line-clamp-3 font-semibold leading-snug text-zinc-900 transition-colors hover:text-icaire-700 dark:text-zinc-50 dark:hover:text-icaire-400 ${compact ? "text-sm" : "text-base"}`}>
            {paper.title}
          </h3>
        </Link>

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

        <div className={`flex items-center gap-2 ${compact ? "mt-4" : "mt-6"}`}>
          {paper.link && (
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-icaire-600 text-xs font-semibold text-white transition-all hover:scale-[1.04] hover:bg-icaire-700 active:scale-[0.97] dark:bg-icaire-500 dark:hover:bg-icaire-400 ${
                compact ? "px-3.5 py-1.5" : "px-4 py-2"
              }`}
            >
              Read Paper
              <ArrowUpRight size={13} />
            </a>
          )}
          <Link
            to={`/papers/${paper.id}`}
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 transition-colors hover:border-icaire-300 hover:text-icaire-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-icaire-700 dark:hover:text-icaire-400 ${
              compact ? "px-3.5 py-1.5" : "px-4 py-2"
            }`}
          >
            Details
          </Link>
        </div>
      </article>
    </Reveal>
  );
}
