import { AnimatePresence, motion } from "framer-motion";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";
import { PlanetOrb } from "./PlanetOrb";

const EASE = [0.16, 1, 0.3, 1] as const;

interface DomainPlanetProps {
  domain: EthicalAiDomain;
  /** Offset from the center of the universe, in px. This is the point on the
   * orbit path — the circle is centered exactly here. */
  x: number;
  y: number;
  /** Circle diameter, in px, before hover/focus scaling. */
  size: number;
  isFocused: boolean;
  isHovered: boolean;
  isFaded: boolean;
  reducedMotion: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}

export function DomainPlanet({
  domain,
  x,
  y,
  size,
  isFocused,
  isHovered,
  isFaded,
  reducedMotion,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: DomainPlanetProps) {
  const groupOpacity = isFaded ? 0.3 : 1;
  const groupScale = isFocused ? 1.9 : isFaded ? 0.72 : 1;
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
          className="absolute flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-icaire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a0a0d]"
          style={{ width: size, height: size, left: -size / 2, top: -size / 2 }}
          animate={{ scale: !isFocused && isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {/* the pale sage sphere, shared with public/taxonomy-orb.svg */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0"
            animate={{ opacity: isFocused || isHovered ? 1 : 0.9 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <PlanetOrb />
          </motion.span>

          {/* label lives inside the planet */}
          <span
            className="relative px-2 text-center font-medium leading-[1.25] tracking-tight text-icaire-800 dark:text-icaire-50/90"
            style={{ fontSize: Math.max(9, Math.round(size * 0.115)) }}
          >
            {domain.compactLabel.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </span>
        </motion.button>

        <AnimatePresence>
          {isHovered && !isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="pointer-events-none absolute left-1/2 z-40 w-52 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white/95 p-3 text-left shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95"
              style={{ top: size / 2 + 14 }}
            >
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{domain.title}</p>
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
