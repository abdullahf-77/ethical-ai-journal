import { AnimatePresence, motion } from "framer-motion";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";
import { PlanetOrb } from "./PlanetOrb";

const EASE = [0.16, 1, 0.3, 1] as const;

interface DomainPlanetProps {
  domain: EthicalAiDomain;
  /** Offset from the center of the universe, in px. This is the point on the
   * orbit path — the orb is centered exactly here. */
  x: number;
  y: number;
  /** Orb diameter, in px, before hover/focus scaling. */
  size: number;
  /** Position along the flattened orbit, 0 (far/top) to 1 (near/bottom).
   * Drives a depth-of-field scale and opacity so orbs on the near side of
   * the ellipse read as closer than orbs on the far side. */
  depth: number;
  isFocused: boolean;
  isHovered: boolean;
  isFaded: boolean;
  reducedMotion: boolean;
  /** How large the focused orb grows, as a multiple of `size`. Passed in
   * (rather than hardcoded here) so TaxonomyUniverse's anchor/backdrop math
   * — which needs this same number to size the space it clears for the
   * focused orb — can never drift out of sync with it. */
  focusScale: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}

export function DomainPlanet({
  domain,
  x,
  y,
  size,
  depth,
  isFocused,
  isHovered,
  isFaded,
  reducedMotion,
  focusScale,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: DomainPlanetProps) {
  // A stronger, nonlinear front/back curve — the camera reads as sitting
  // close to the near side of the ring, so the front planet grows and
  // sharpens quickly while the back ones stay small and hazy for most of
  // their pass. `depthCurve` is depth reshaped through an easing power
  // rather than depth itself, which is what gives the exaggerated
  // near-vs-far contrast without touching the ellipse's actual flatness.
  const depthCurve = Math.pow(depth, 1.6);
  // Front-planet cap pulled down from 1.5x — it read as too large. Far side
  // is untouched; only how big the near side is allowed to grow changes.
  const depthScale = 0.52 + 0.73 * depthCurve; // ~0.52 (far) .. 1.25 (near)
  // Opacity floor raised again — 0.55 still read as too faint on the far
  // side; 0.7 keeps back planets clearly legible while the near side stays
  // fully present and a (now subtler) front-vs-back cue survives.
  const depthOpacity = 0.7 + 0.3 * Math.pow(depth, 1.25); // ~0.7 (far) .. 1 (near)
  const groupOpacity = isFocused ? 1 : isFaded ? depthOpacity * 0.34 : depthOpacity;
  // The text box (size * 0.74) and both font sizes (size * 0.071 / 0.046)
  // are all fractions of the same `size`, and the whole button — box, text,
  // and all — is what `focusScale` transforms, so the fit between text and
  // circle is scale-invariant: whatever focusScale TaxonomyUniverse passes
  // in, the longest title + description already fits, it just renders
  // bigger or smaller on screen.
  const groupScale = isFocused ? focusScale : isFaded ? depthScale * 0.8 : depthScale;
  // Wider spread (10-100) than the old 10-40 range so ten planets at
  // continuously varying depth still resolve into a clean front-to-back
  // stack; hover/focus tiers are bumped up to match.
  const zIndex = isFocused ? 200 : isHovered ? 120 : 10 + Math.round(depth * 90);

  return (
    <div className="absolute left-1/2 top-1/2" style={{ zIndex }}>
      <motion.div
        className="relative"
        animate={{ x, y, opacity: groupOpacity, scale: groupScale }}
        transition={{ duration: reducedMotion ? 0.25 : 0.85, ease: EASE }}
        style={{ willChange: "transform" }}
      >
        {/* The orb is centered on the orbit point itself. */}
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
          <PlanetOrb domainId={domain.id} emphasized={isHovered || isFocused} />

          {/* The full official principle title, verbatim, inside the orb.
              The text box is 72% of the diameter — a square inscribed in a
              circle is 70.7% of it, so this keeps the longest line clear of
              the curve while leaving room for four lines of type. */}
          {/* Type scales with the orb rather than being clamped to a floor.
              The longest word comes to 0.663 * size and the box is 0.72 *
              size, so the fit holds at any diameter; clamping the font
              would let the box shrink past the word and overflow.

              Every ratio below is a fraction of `size`, so these all hold
              at any container width. */}
          {isFocused ? (
            <span
              className="relative block hyphens-auto break-words text-center"
              lang="en"
              style={{ width: size * 0.74 }}
            >
              <span
                className="block font-serif font-semibold leading-[1.2] tracking-tight text-zinc-900 dark:text-zinc-50"
                style={{ fontSize: size * 0.071 }}
              >
                {domain.title}
              </span>
              <span
                className="block leading-[1.35] text-zinc-500 dark:text-zinc-400"
                style={{ fontSize: size * 0.046, marginTop: size * 0.036 }}
              >
                {domain.description}
              </span>
            </span>
          ) : (
            <span
              className="relative block hyphens-auto break-words text-center font-medium leading-[1.25] text-zinc-600 dark:text-zinc-300"
              lang="en"
              style={{ width: size * 0.72, fontSize: size * 0.075 }}
            >
              {domain.title}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {isHovered && !isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="pointer-events-none absolute left-1/2 z-40 w-56 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white/95 p-3 text-left shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95"
              style={{ top: size / 2 + 8 }}
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
