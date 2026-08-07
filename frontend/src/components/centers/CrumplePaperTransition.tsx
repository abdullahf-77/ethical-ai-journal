import { useId } from "react";
import { motion } from "framer-motion";
import { blobPath } from "../../lib/blob";

const EASE = [0.16, 1, 0.3, 1] as const;

interface CrumplePaperTransitionProps {
  /** Viewport-relative pixel coordinates of the cluster that was clicked
   * (or, on the way back, of the cluster being returned to) — the point the
   * paper appears to unfold from/into. */
  origin: { x: number; y: number };
  /** "in" plays a small crumpled ball expanding to cover the screen
   * (entering a region); "out" plays the reverse (leaving one). */
  direction: "in" | "out";
  reducedMotion: boolean;
  onComplete: () => void;
}

/** The "unfold like crumpled paper" reveal between the cluster view and a
 * region view. Approximates the reference (a paper ball unfurling into a
 * flat sheet) with an SVG blob (lib/blob.ts) that scales from/to a pinpoint
 * at the clicked cluster's screen position, with a quick rotational wobble
 * to sell the unfurling motion — plain SVG + Framer Motion, no video asset. */
export function CrumplePaperTransition({ origin, direction, reducedMotion, onComplete }: CrumplePaperTransitionProps) {
  const uid = useId();
  const gradientId = `crumple-gradient-${uid}`;
  const filterId = `crumple-filter-${uid}`;
  const d = blobPath(`transition-${direction}`, 170, 14, 0.3);

  const small = 0.05;
  const large = 45;

  if (reducedMotion) {
    return <motion.div className="fixed inset-0 z-[100] bg-white dark:bg-[#0a0a0d]" animate={{ opacity: [1, 1, 0] }} transition={{ duration: 0.15 }} onAnimationComplete={onComplete} />;
  }

  return (
    <motion.div
      className="pointer-events-none fixed z-[100]"
      style={{ left: origin.x, top: origin.y, width: 1, height: 1 }}
      initial={{ scale: direction === "in" ? small : large, opacity: 1 }}
      animate={{
        scale: direction === "in" ? large : small,
        rotate: direction === "in" ? [0, -8, 5, 0] : [0, 6, -8, 0],
      }}
      transition={{ duration: 0.68, ease: EASE }}
      onAnimationComplete={onComplete}
    >
      <svg
        viewBox="-200 -200 400 400"
        width="400"
        height="400"
        className="absolute -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fdfdfd" />
            <stop offset="55%" stopColor="#dcdce0" />
            <stop offset="100%" stopColor="#77777f" />
          </radialGradient>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path d={d} fill={`url(#${gradientId})`} filter={`url(#${filterId})`} />
      </svg>
    </motion.div>
  );
}
