import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Abstract central object representing the whole Ethical AI Taxonomy.
 * Deliberately not a literal "sun" — a soft, minimal orb with a faint
 * glow and a couple of thin orbital rings for depth.
 */
export function TaxonomyOrb({ dimmed }: { dimmed: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 z-10"
      style={{ x: "-50%", y: "-50%" }}
      animate={{ opacity: dimmed ? 0.1 : 1, scale: dimmed ? 0.82 : 1 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="relative flex size-[124px] items-center justify-center sm:size-[156px]">
        <div
          className="absolute inset-[-56px] rounded-full blur-2xl"
          style={{ background: "radial-gradient(closest-side, rgba(0,122,51,0.30), transparent)" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-[-56px] hidden rounded-full blur-2xl dark:block"
          style={{ background: "radial-gradient(closest-side, rgba(107,183,94,0.35), transparent)" }}
          aria-hidden="true"
        />

        <div className="absolute inset-[-24px] rounded-full border border-icaire-700/15 dark:border-icaire-300/12" aria-hidden="true" />
        <div className="absolute inset-[-46px] rounded-full border border-icaire-700/8 dark:border-icaire-300/6" aria-hidden="true" />

        <div
          className="relative flex size-full items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-icaire-400 via-icaire-600 to-icaire-800 text-center shadow-[0_0_50px_-8px_rgba(0,122,51,0.55)] dark:border-white/10 dark:from-icaire-400 dark:via-icaire-600 dark:to-icaire-900"
          aria-hidden="true"
        >
          <div
            className="absolute inset-1 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), transparent 55%)" }}
          />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/95 sm:text-[11px]">
              Ethical AI
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/95 sm:text-[11px]">
              Taxonomy
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
