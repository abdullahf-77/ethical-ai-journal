import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Text shown below the row once a Domain planet has risen up and grown to
 * become the focus. Deliberately not a rectangular card — typography and
 * spacing are arranged around the (already-rendered, enlarged) planet
 * instead.
 */
export function DomainFocus({ domain, onBack }: { domain: EthicalAiDomain; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
      className="mx-auto flex max-w-md flex-col items-center px-6 pt-8 text-center sm:pt-10"
    >
      <p className="text-sm font-semibold tabular-nums tracking-[0.2em] text-icaire-600 dark:text-icaire-400">
        {domain.number}
      </p>
      <h2 className="mt-2 max-w-md text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
        {domain.title}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {domain.description}
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-semibold text-zinc-600 backdrop-blur-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <ArrowLeft size={13} />
        Back to all domains
      </button>
    </motion.div>
  );
}
