import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { PrinciplePaper } from "../../data/principlePapers";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The papers view's left-hand list: titles only, each one a link to the
 * spreadsheet's `link` column, opened safely in a new tab. No abstracts,
 * authors, dates, or any other metadata — the brief was explicit that the
 * title is the only thing shown.
 */
export function PrinciplePapersPanel({
  papers,
  maxHeight,
}: {
  papers: PrinciplePaper[];
  maxHeight: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="absolute inset-y-0 left-0 z-[105] w-[38%] min-w-[220px] max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white/85 p-3 shadow-sm backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/85"
      style={{ maxHeight }}
    >
      {papers.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">No papers indexed under this principle yet.</p>
      ) : (
        <ul className="space-y-1">
          {papers.map((paper, i) => (
            <li key={i}>
              <a
                href={paper.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-1.5 rounded-md px-1.5 py-1 text-sm leading-snug text-zinc-600 transition-colors hover:bg-icaire-50 hover:text-icaire-700 dark:text-zinc-300 dark:hover:bg-icaire-950/40 dark:hover:text-icaire-400"
              >
                <ExternalLink size={12} className="mt-1 shrink-0 opacity-40 group-hover:opacity-100" />
                <span>{paper.title}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
