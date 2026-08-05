import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Text shown once a Domain planet has animated into the (otherwise empty)
 * center of the TaxonomyUniverse. Deliberately not a rectangular card —
 * typography and spacing are arranged below the enlarged planet instead.
 */
export function DomainFocus({ domain, onBack }: { domain: EthicalAiDomain; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
      className="pointer-events-none absolute inset-x-0 top-1/2 z-50 mt-12 flex flex-col items-center px-6 text-center sm:mt-16"
    >
      <h2 className="max-w-md text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
        {domain.title}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {domain.description}
      </p>

      <button
        type="button"
        onClick={onBack}
        className="pointer-events-auto mt-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-semibold text-zinc-600 backdrop-blur-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <ArrowLeft size={13} />
        Back to all domains
      </button>
    </motion.div>
  );
}
