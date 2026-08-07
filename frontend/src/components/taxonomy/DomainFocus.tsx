import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The "Enter" control anchored below the selected-but-not-yet-entered
 * planet, which always sits centered while this is showing (see
 * TaxonomyUniverse — the focused planet only moves to the top-right once
 * "Enter" is clicked, at which point this component stops rendering
 * entirely). There is no "Back" button in either stage: clicking anywhere in
 * the background exits back to the universe, both here and in the papers
 * view — see the backdrop in TaxonomyUniverse.
 */
export function DomainFocus({ radius, onEnter }: { radius: number; onEnter: () => void }) {
  const gap = 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, x: 0, y: radius + gap }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.45, ease: EASE }}
      // Above every non-focused planet's max depth z-index (100, see
      // DomainPlanet's zIndex formula) but below the focused planet itself
      // (200).
      className="absolute left-1/2 top-1/2 z-[110] flex -translate-x-1/2 justify-center gap-2 px-6"
    >
      <button
        type="button"
        onClick={onEnter}
        className="inline-flex items-center gap-1.5 rounded-full bg-icaire-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-icaire-700 dark:bg-icaire-500 dark:hover:bg-icaire-400"
      >
        Enter
        <ChevronRight size={13} />
      </button>
    </motion.div>
  );
}
