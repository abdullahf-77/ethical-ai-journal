import { motion } from "framer-motion";
import { PlanetOrb } from "../taxonomy/PlanetOrb";

const EASE = [0.16, 1, 0.3, 1] as const;
const PAPER_COUNT = 14;

// Scattered around the globe at golden-angle increments (same phyllotaxis
// spacing as lib/spiral.ts) so they fan out evenly with no manual tuning,
// each on one of four rings so they don't all sit on a single circle.
const PAPERS = Array.from({ length: PAPER_COUNT }, (_, i) => {
  const angle = i * 137.50776;
  const radius = 150 + (i % 4) * 38;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
    rotate: (i * 47) % 360,
  };
});

function PaperIcon() {
  return (
    <svg viewBox="0 0 24 30" width="20" height="25" aria-hidden="true" className="text-icaire-700/70 dark:text-icaire-300/70">
      <path d="M3 1h13l5 5v23H3z" fill="white" fillOpacity="0.92" stroke="currentColor" strokeWidth="1.4" className="dark:fill-zinc-900" />
      <path d="M16 1v5h5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

type IntroStage = "globe" | "pulling" | "morphing";

/** Stages 1–3 of the centers intro: a wireframe globe (PlanetOrb, same
 * artwork used across the Taxonomy Hub) surrounded by floating "paper"
 * icons that pull inward on "pulling", then the whole thing fades out on
 * "morphing" as FibonacciSpiralBackground (rendered separately by
 * CentersPage, underneath this) fades in to replace it. */
export function CentersIntro({ stage, reducedMotion }: { stage: IntroStage; reducedMotion: boolean }) {
  const gathered = stage !== "globe";
  const dissolving = stage === "morphing";

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <motion.div
        className="relative"
        animate={{ opacity: dissolving ? 0 : 1, scale: dissolving ? 0.6 : 1 }}
        transition={{ duration: reducedMotion ? 0.2 : 0.9, ease: EASE }}
        style={{ width: 260, height: 260 }}
      >
        {/* domainId is purely decorative here — the centers intro isn't tied
            to any one taxonomy domain, so it reuses the first domain's
            geometry (id 1) just for the shared wireframe-planet artwork. */}
        <PlanetOrb domainId={1} emphasized />
      </motion.div>

      {PAPERS.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          initial={false}
          animate={{
            x: gathered ? 0 : p.x,
            y: gathered ? 0 : p.y,
            opacity: dissolving ? 0 : 1,
            rotate: p.rotate,
            scale: dissolving ? 0.4 : 1,
          }}
          transition={{
            duration: reducedMotion ? 0.2 : 1.1,
            delay: reducedMotion ? 0 : (p.id % 7) * 0.035,
            ease: EASE,
          }}
          style={{ marginLeft: -10, marginTop: -12 }}
        >
          <PaperIcon />
        </motion.div>
      ))}
    </div>
  );
}
