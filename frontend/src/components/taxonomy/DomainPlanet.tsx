import { AnimatePresence, motion } from "framer-motion";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";

const EASE = [0.16, 1, 0.3, 1] as const;

export type LabelPlacement = "top" | "bottom" | "left" | "right";

interface DomainPlanetProps {
  domain: EthicalAiDomain;
  /** Offset from the center of the universe, in px. This is the point on the
   * orbit path — the circle is centered exactly here, and the label is
   * offset around it rather than sharing its centering. */
  x: number;
  y: number;
  /** Circle diameter, in px, before hover/focus scaling. */
  size: number;
  isFocused: boolean;
  isHovered: boolean;
  isFaded: boolean;
  labelPlacement: LabelPlacement;
  reducedMotion: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}

/** Where the label sits relative to the circle, given the circle is centered
 * on the orbit point. Uses a gap measured from the circle's edge. */
function labelStyle(placement: LabelPlacement, size: number): React.CSSProperties {
  const gap = 10;
  const edge = size / 2 + gap;
  switch (placement) {
    case "right":
      return { left: edge, top: "50%", transform: "translateY(-50%)", textAlign: "left" };
    case "left":
      return { right: edge, top: "50%", transform: "translateY(-50%)", textAlign: "right" };
    case "top":
      return { bottom: edge, left: "50%", transform: "translateX(-50%)", textAlign: "center" };
    case "bottom":
      return { top: edge, left: "50%", transform: "translateX(-50%)", textAlign: "center" };
  }
}

export function DomainPlanet({
  domain,
  x,
  y,
  size,
  isFocused,
  isHovered,
  isFaded,
  labelPlacement,
  reducedMotion,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: DomainPlanetProps) {
  const groupOpacity = isFaded ? 0.3 : 1;
  const groupScale = isFocused ? 2.1 : isFaded ? 0.75 : 1;
  const zIndex = isFocused ? 60 : isHovered ? 50 : 20;

  return (
    <div className="absolute left-1/2 top-1/2" style={{ zIndex }}>
      <motion.div
        className="relative"
        animate={{ x, y, opacity: groupOpacity, scale: groupScale }}
        transition={{ duration: reducedMotion ? 0.25 : 0.85, ease: EASE }}
        style={{ willChange: "transform" }}
      >
        {/* The circle is centered on the orbit point itself. */}
        <motion.button
          type="button"
          onClick={onSelect}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          onFocus={onHoverStart}
          onBlur={onHoverEnd}
          aria-label={domain.title}
          className="absolute rounded-full outline-none focus-visible:ring-2 focus-visible:ring-icaire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a0a0d]"
          style={{ width: size, height: size, left: -size / 2, top: -size / 2 }}
          animate={{ scale: !isFocused && isHovered ? 1.2 : 1 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {/* Thin, translucent circle — the same restraint as the rings and
              dots in the Hero's orbit motif, not a solid filled ball. */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-icaire-700/30 bg-icaire-700/10 dark:border-icaire-300/30 dark:bg-icaire-300/10"
            animate={{ opacity: isFocused || isHovered ? 1 : 0.85 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-60"
            style={{
              background: "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.5), transparent 60%)",
            }}
          />
        </motion.button>

        {!isFocused && !isHovered && (
          <div
            className="pointer-events-none absolute w-max max-w-[140px] leading-tight"
            style={labelStyle(labelPlacement, size)}
          >
            <p className="text-[12.5px] font-medium leading-snug text-zinc-500 dark:text-zinc-400">
              {domain.shortLabel[0]}
              {domain.shortLabel[1] && (
                <>
                  <br />
                  {domain.shortLabel[1]}
                </>
              )}
            </p>
          </div>
        )}

        <AnimatePresence>
          {isHovered && !isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="pointer-events-none absolute left-1/2 z-40 w-48 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white/95 p-3 text-left shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95"
              style={{ top: size / 2 + 14 }}
            >
              <p className="text-[10px] font-semibold tabular-nums tracking-wider text-icaire-600 dark:text-icaire-400">
                {domain.number}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-zinc-900 dark:text-zinc-50">{domain.title}</p>
              <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                {domain.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
