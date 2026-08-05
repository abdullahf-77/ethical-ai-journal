import { AnimatePresence, motion } from "framer-motion";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";

const EASE = [0.16, 1, 0.3, 1] as const;

export type LabelPlacement = "top" | "bottom" | "left" | "right";

interface DomainPlanetProps {
  domain: EthicalAiDomain;
  /** Target offset from the universe's center, in px. */
  x: number;
  y: number;
  /** Base dot diameter, in px, before hover/focus scaling. */
  size: number;
  isFocused: boolean;
  isHovered: boolean;
  isFaded: boolean;
  showLabel: boolean;
  labelPlacement: LabelPlacement;
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
  showLabel,
  labelPlacement,
  reducedMotion,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: DomainPlanetProps) {
  const groupOpacity = isFaded ? 0.32 : 1;
  const groupScale = isFocused ? 2.2 : isFaded ? 0.72 : 1;

  const rowLayout = labelPlacement === "left" || labelPlacement === "right";
  const flexDirection = rowLayout
    ? labelPlacement === "right"
      ? "flex-row"
      : "flex-row-reverse"
    : labelPlacement === "bottom"
      ? "flex-col"
      : "flex-col-reverse";
  const textAlign = rowLayout ? (labelPlacement === "right" ? "text-left" : "text-right") : "text-center";

  const zIndex = isFocused ? 60 : isHovered ? 50 : 20;

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{ transform: "translate(-50%, -50%)", zIndex }}
    >
      <motion.div
        animate={{ x, y, opacity: groupOpacity, scale: groupScale }}
        transition={{ duration: reducedMotion ? 0.25 : 0.8, ease: EASE }}
        style={{ willChange: "transform" }}
      >
        <div className={`relative flex items-center gap-2.5 ${flexDirection}`}>
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
              scale: !isFocused && isHovered ? 1.28 : 1,
            }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <span
              aria-hidden="true"
              className="absolute rounded-full blur-md"
              style={{
                inset: -10,
                background: `radial-gradient(closest-side, ${domain.color.glow}, transparent)`,
                opacity: isFocused ? 1 : isHovered ? 0.9 : 0.55,
              }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] dark:border-white/10"
              style={{
                background: `linear-gradient(145deg, ${domain.color.from}, ${domain.color.to})`,
              }}
            />
          </motion.button>

          {showLabel && !isFocused && (
            <div className={`w-max max-w-[128px] leading-tight ${textAlign}`}>
              <p className="text-[10px] font-semibold tabular-nums tracking-wider text-zinc-400 dark:text-zinc-500">
                {domain.number}
              </p>
              <p className="text-[12px] font-medium leading-snug text-zinc-600 dark:text-zinc-300">
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
                className="pointer-events-none absolute left-1/2 top-full z-40 mt-3 w-48 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white/95 p-3 text-left shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95"
              >
                <p
                  className="text-[10px] font-semibold tabular-nums tracking-wider"
                  style={{ color: domain.color.to }}
                >
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
