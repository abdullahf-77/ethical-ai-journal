import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CenterGroup } from "../../types";
import { blobPath } from "../../lib/blob";

const EASE = [0.16, 1, 0.3, 1] as const;

interface GroupClusterProps {
  group: CenterGroup;
  centerCount: number;
  countryCount: number;
  x: number;
  y: number;
  size: number;
  isHovered: boolean;
  isFaded: boolean;
  reducedMotion: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}

/** One crumpled-paper cluster node — a jittered organic blob (see
 * lib/blob.ts) with a paper-toned gradient and a light feTurbulence
 * distortion for a crinkled edge, positioned along the Fibonacci spiral. */
export function GroupCluster({
  group,
  centerCount,
  countryCount,
  x,
  y,
  size,
  isHovered,
  isFaded,
  reducedMotion,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: GroupClusterProps) {
  const uid = useId();
  const gradientId = `paper-gradient-${uid}`;
  const filterId = `paper-crumple-${uid}`;
  const d = blobPath(group.id, 130, 12, 0.34);
  // group.id.length alone collides for "II"/"Va"/"Vb" (all length 2), which
  // would give them identical turbulence noise — sum char codes instead so
  // every group gets a visually distinct crumple texture.
  const turbulenceSeed = group.id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  return (
    <div className="absolute left-1/2 top-1/2" style={{ zIndex: isHovered ? 50 : 20 }}>
      <motion.div
        className="relative"
        animate={{ x, y, opacity: isFaded ? 0.35 : 1, scale: isHovered ? 1.08 : 1 }}
        transition={{ duration: reducedMotion ? 0.2 : 0.85, ease: EASE }}
        style={{ willChange: "transform" }}
      >
        <button
          type="button"
          onClick={onSelect}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          onFocus={onHoverStart}
          onBlur={onHoverEnd}
          aria-label={`${group.label} — ${group.regionName}`}
          className="absolute flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-icaire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a0a0d]"
          style={{ width: size, height: size, left: -size / 2, top: -size / 2 }}
        >
          <svg viewBox="-150 -150 300 300" className="h-full w-full drop-shadow-md" aria-hidden="true">
            <defs>
              <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#fafafa" />
                <stop offset="55%" stopColor="#d4d4d8" />
                <stop offset="100%" stopColor="#8a8a92" />
              </radialGradient>
              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={turbulenceSeed} result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <path d={d} fill={`url(#${gradientId})`} filter={`url(#${filterId})`} stroke="#a1a1aa" strokeWidth="1.5" strokeOpacity="0.4" />
          </svg>

          <span
            className="relative block text-center font-serif font-semibold leading-tight text-zinc-800 mix-blend-multiply dark:text-zinc-900"
            style={{ fontSize: size * 0.16 }}
          >
            {group.id}
          </span>
        </button>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="pointer-events-none absolute left-1/2 z-40 w-52 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white/95 p-3 text-left shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95"
              style={{ top: size / 2 + 10 }}
            >
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                {group.label} — {group.regionName}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                {centerCount} center{centerCount === 1 ? "" : "s"} across {countryCount} countr
                {countryCount === 1 ? "y" : "ies"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
