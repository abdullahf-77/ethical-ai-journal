import { AnimatePresence, motion } from "framer-motion";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";

const EASE = [0.16, 1, 0.3, 1] as const;

interface DomainPlanetProps {
  domain: EthicalAiDomain;
  /** Small offset from this planet's fixed row slot, in px (wobble + focus transform). */
  x: number;
  y: number;
  /** Base dot diameter, in px, before hover/focus scaling. */
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
  const groupOpacity = isFaded ? 0.32 : 1;
  const groupScale = isFocused ? 2.15 : isFaded ? 0.72 : 1;
  const zIndex = isFocused ? 60 : isHovered ? 50 : 20;

  return (
    <div className="relative" style={{ zIndex }}>
      <motion.div
        animate={{ x, y, opacity: groupOpacity, scale: groupScale }}
        transition={{ duration: reducedMotion ? 0.25 : 0.9, ease: EASE }}
        style={{ willChange: "transform" }}
      >
        <div className="relative flex flex-col items-center gap-2.5">
          <motion.button
            type="button"
            onClick={onSelect}
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onFocus={onHoverStart}
            onBlur={onHoverEnd}
            aria-label={domain.title}
            className="relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-icaire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a0a0d]"
            style={{ width: size, height: size }}
            animate={{
              scale: !isFocused && isHovered ? 1.22 : 1,
            }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {/* soft green glow, same family as the Hero's orbit motif */}
            <span
              aria-hidden="true"
              className="absolute rounded-full bg-icaire-500/35 blur-md dark:bg-icaire-400/40"
              style={{
                inset: -10,
                opacity: isFocused ? 1 : isHovered ? 0.9 : 0.5,
              }}
            />
            {/* sphere body — plain, unified icaire green, lit from the front/upper-left */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-gradient-to-br from-icaire-200 via-icaire-500 to-icaire-700 dark:from-icaire-300 dark:via-icaire-600 dark:to-icaire-900"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full opacity-70"
              style={{ background: "radial-gradient(circle at 33% 28%, rgba(255,255,255,0.65), transparent 55%)" }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full opacity-45"
              style={{ background: "radial-gradient(circle at 72% 80%, rgba(0,0,0,0.35), transparent 60%)" }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-white/50 dark:border-white/15"
            />
          </motion.button>

          {!isFocused && (
            <p className="text-[11px] font-semibold tabular-nums tracking-wider text-icaire-600 dark:text-icaire-400">
              {domain.number}
            </p>
          )}

          <AnimatePresence>
            {isHovered && !isFocused && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="pointer-events-none absolute left-1/2 top-full z-40 mt-3 w-48 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white/95 p-3 text-left shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95"
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
        </div>
      </motion.div>
    </div>
  );
}
