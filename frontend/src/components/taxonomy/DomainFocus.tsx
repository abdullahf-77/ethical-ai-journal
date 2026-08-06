import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The control for leaving the focused state. The principle's title and
 * description are rendered inside the orb itself (see DomainPlanet), so
 * this is only the way back out.
 *
 * `topOffset` is the focused orb's radius plus a gap, passed in from
 * TaxonomyUniverse so the button always clears the enlarged orb.
 */
export function DomainFocus({ onBack, topOffset }: { onBack: () => void; topOffset: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.45, delay: 0.35, ease: EASE }}
      // Above every non-focused planet's max depth z-index (100, see
      // DomainPlanet's zIndex formula) but below the focused planet itself
      // (200) — the focused orb's own title/description render inside the
      // orb, so this "back" control only ever needs to clear pushed-out
      // background planets, never the focused one.
      className="absolute inset-x-0 top-1/2 z-[110] flex justify-center px-6"
      style={{ marginTop: topOffset }}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-semibold text-zinc-600 backdrop-blur-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <ArrowLeft size={13} />
        Back to all principles
      </button>
    </motion.div>
  );
}
