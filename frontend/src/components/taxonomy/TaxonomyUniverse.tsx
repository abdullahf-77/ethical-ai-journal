import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";
import { ethicalAiDomains } from "../../data/ethicalAiDomains";
import { DomainPlanet } from "./DomainPlanet";
import { PlanetOrb } from "./PlanetOrb";
import { DomainFocus } from "./DomainFocus";
import { PaperAttractionField } from "./PaperAttractionField";
import { PrinciplePapersPanel } from "./PrinciplePapersPanel";
import { angleAtArc, ellipseTable } from "../../lib/orbitMath";
import { getPapersForPrinciple } from "../../data/principlePapers";

/** A domain's `number` field ("01".."10") is exactly its UNESCO principle's
 * numeric suffix, so this is a direct string join, not a lookup table. */
function principleIdFor(domain: { number: string }): string {
  return `P${domain.number}`;
}

const EASE = [0.16, 1, 0.3, 1] as const;

type Viewport = "mobile" | "tablet" | "desktop";

/** One shared elliptical path for all ten domains, advancing together at a
 * single slow speed so their relative order is fixed forever. Spacing is by
 * arc length rather than equal angle steps — see ../../lib/orbitMath — so
 * the gap between neighbours stays constant even though the ellipse is
 * strongly flattened. */
const ORBIT_PERIOD_SECONDS = 65;
/** Ellipse half-width as a fraction of the container's half-width. Brought
 * in from 0.97 — the whole ring reads as too large/dominant at full width;
 * this shrinks the ring itself (both rx and the ry derived from it) while
 * keeping the oval's proportions (see RING_HEIGHT_RATIO) untouched. */
const RING_WIDTH = 0.82;
/** Ellipse half-height as a fraction of half-width — how flat the oval is.
 * Also drives the dashed guide line's SVG ellipse below, so the drawn path
 * and the planets' real orbit can never drift apart again the way they just
 * did (the SVG had its own hardcoded rx/ry that stopped matching this). */
const RING_HEIGHT_RATIO = 0.3;
/** How much the whole ring (planets AND the drawn dashed line together)
 * grows while a principle is focused, to clear the enlarged focused orb in
 * the middle. */
const FOCUS_RING_SCALE = 1.5;

/** The SVG's viewBox must keep the SAME aspect ratio as the container
 * (see the aspect-[16/7.2] class below), otherwise preserveAspectRatio
 * letterboxes the drawing and the dashed line stops matching the orbit the
 * planets actually travel. Changing one means changing the other. */
const VIEWBOX_W = 1600;
const VIEWBOX_H = 720;

/** How strongly planet spacing is biased toward the front of the ring.
 * 0 = perfectly even spacing all the way round; higher values open the
 * front out and let the crowding fall to the back instead. Front spacing
 * ends up (1 + n)x normal and back spacing (1 - n)x, so this must stay
 * below 1 to keep the ordering monotonic. */
const FRONT_SPREAD = 0.5;

/** Redistributes an arc-length position so that neighbours sit further
 * apart across the front of the ring and closer together across the back.
 *
 * Planets are laid out by arc length (see ../../lib/orbitMath), which gives
 * perfectly even spacing — but the front planets are also drawn much larger
 * by the depth scale, so even spacing reads as crowded down there and
 * over-airy up the back. This warps the position by a smooth sine so the
 * local spacing is stretched at the front (u = 0.5, the near point) and
 * squeezed at the back (u = 0, the far point), while staying continuous and
 * periodic — so planets simply glide slightly faster through the back of
 * the orbit and slower across the front, and never reorder or jump. */
function frontBiasedArc(s: number, total: number) {
  const u = (((s / total) % 1) + 1) % 1;
  return (u - (FRONT_SPREAD * Math.sin(2 * Math.PI * u)) / (2 * Math.PI)) * total;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setViewport(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return viewport;
}

/** A slow, pausable clock in elapsed seconds. Throttled to ~30fps — the
 * orbit and papers both move fast enough now that the previous 15fps tick
 * would read as a visible stutter rather than as smooth drift. */
function useOrbitClock(paused: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const accRef = useRef(0);

  useEffect(() => {
    if (paused) {
      lastRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      accRef.current += dt;
      if (accRef.current >= 1 / 30) {
        setElapsed((e) => e + accRef.current);
        accRef.current = 0;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [paused]);

  return elapsed;
}

export function TaxonomyUniverse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);
  const [containerHeight, setContainerHeight] = useState(900 * (VIEWBOX_H / VIEWBOX_W));
  const viewport = useViewport();
  const reducedMotion = usePrefersReducedMotion();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Whether the user has clicked "Enter" on the currently-selected planet.
  // Selecting a planet only focuses it (existing behavior); this is the
  // extra step that opens the papers view.
  const [entered, setEntered] = useState(false);

  // The whole system pauses while a domain is hovered or focused. The clock
  // holds its last value while paused, so positions simply freeze in place.
  const paused = selectedId !== null || hoveredId !== null || reducedMotion;
  const elapsed = useOrbitClock(paused);

  const selected = selectedId != null ? ethicalAiDomains.find((d) => d.id === selectedId) ?? null : null;
  const papers = useMemo(() => (selected ? getPapersForPrinciple(principleIdFor(selected)) : []), [selected]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect?.width) setContainerWidth(rect.width);
      if (rect?.height) setContainerHeight(rect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    setHoveredId(null);
    setEntered(false);
  };
  const handleEnter = () => setEntered(true);

  if (viewport === "mobile") {
    return <MobileDomainList selectedId={selectedId} onSelect={handleSelect} entered={entered} onEnter={handleEnter} />;
  }

  // Wide, flattened ellipse seen almost edge-on, with depth: the bottom of
  // the path is the near side (larger, fully opaque), the top is the far
  // side (smaller, dimmer, passing behind the orbit line).
  const rx = (containerWidth / 2) * RING_WIDTH;
  const ry = rx * RING_HEIGHT_RATIO;
  const dotSize = containerWidth * 0.15;

  const table = useMemo(() => ellipseTable(rx, ry), [rx, ry]);
  const gap = table.total / ethicalAiDomains.length;

  // During focus the whole ring grows. A UNIFORM scale of the ellipse is
  // still an ellipse of the same proportions, so arc-length spacing (and
  // therefore every angle the table returns) is unchanged — the planets
  // just sit on a bigger copy of the same curve. The drawn dashed line
  // below is animated to exactly the same scale, so they stay on it.
  const ringScale = selectedId !== null ? FOCUS_RING_SCALE : 1;
  const rxEff = rx * ringScale;
  const ryEff = ry * ringScale;

  const count = ethicalAiDomains.length;
  const selectedIndex = selectedId != null ? ethicalAiDomains.findIndex((d) => d.id === selectedId) : -1;
  // Arc position of the focused planet, and the even spacing used to lay the
  // remaining nine back out around the ring (see the push-out block below).
  const sFocus = selectedIndex >= 0 ? selectedIndex * gap + (elapsed / ORBIT_PERIOD_SECONDS) * table.total : 0;
  const focusClear = table.total * 0.11;
  const focusStep = (table.total - 2 * focusClear) / (count - 2);

  // Once "Enter" is clicked the focused planet moves from dead center to
  // this top-right anchor, clearing room on the left for the paper list.
  // Its on-screen radius doesn't change (DomainPlanet's focus scale is a
  // constant 2.6 in both states — see the isFocused branch below), so the
  // anchor only needs to keep that same-sized orb clear of the container's
  // top and right edges.
  const focusedRadius = (dotSize * 2.6) / 2;
  const EDGE_PAD = 20;
  const topRightX = containerWidth / 2 - focusedRadius - EDGE_PAD;
  const topRightY = -(containerHeight / 2 - focusedRadius - EDGE_PAD);

  return (
    <div className="relative">
      {/* aspect-[16/7.2] matches VIEWBOX_W / VIEWBOX_H exactly — keep them in
          sync. The ring is only as tall as 2 * ry, so the old 16/8.8 box left
          a wide empty band above (and below) it; trimming the box's height
          lifts the whole orbit up under the copy without touching rx, ry or
          the planet size, all of which derive from the container's WIDTH. */}
      <div
        ref={containerRef}
        // The flattened 16/7.2 ring is deliberately short — but the focused
        // planet at 2.6x scale visually overflows it well beyond its own
        // box in EITHER focused stage, not just once entered (it always
        // has, even before this fix — the box was only ever meant to bound
        // the orbit ellipse, not the enlarged planet). That overflow is
        // harmless for the ring/anchor math (driven by width, not height —
        // see rx/ry below), but the exit-backdrop below is an `inset-0` of
        // this same box: while the box stayed short during "selected, not
        // entered" too, most of what a person actually sees as "the
        // background" around the oversized planet sat outside the box's
        // real bounds, so clicking it did nothing. Growing the box for any
        // selection (not just entered) gives the backdrop real coverage in
        // both stages, and also gives the entered stage's top-right anchor
        // somewhere real to land (previously computed to ~1px of travel).
        className={`relative mx-auto mt-1 w-full max-w-[820px] transition-[aspect-ratio] duration-300 lg:max-w-[1180px] ${
          selectedId !== null ? "aspect-[16/12]" : "aspect-[16/7.2]"
        }`}
      >
        {/* the shared path itself — one faint dashed ellipse, using the same
            broken-line treatment as the flow lines in the Hero artwork */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-icaire-700/[0.32] dark:text-icaire-400/[0.4]"
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          aria-hidden="true"
        >
          {/* Animated to exactly the same ringScale the planets use, so the
              drawn path and the orbit they actually travel stay identical in
              focus mode too. */}
          <motion.ellipse
            cx={VIEWBOX_W / 2}
            cy={VIEWBOX_H / 2}
            animate={{
              rx: (VIEWBOX_W / 2) * RING_WIDTH * ringScale,
              ry: (VIEWBOX_W / 2) * RING_WIDTH * RING_HEIGHT_RATIO * ringScale,
            }}
            transition={{ duration: reducedMotion ? 0.25 : 0.85, ease: EASE }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="9 13"
          />
        </svg>

        {/* Populated as a side effect of the domain map just below, with each
            planet's natural (pre-focus-override) orbit position — this is
            what the paper field's flight targets track, so an in-flight
            paper never gets yanked by the focus mode's push-out/zoom
            repositioning (the field just fades out during focus instead;
            see the `hidden` prop below). */}
        {(() => {
          const naturalPositions: { id: number; x: number; y: number; radius: number }[] = [];

          const planetElements = ethicalAiDomains.map((domain, index) => {
            // Spaced by arc length rather than angle, so the gap between
            // neighbours stays constant all the way around the flattened path.
            const ang = angleAtArc(
              table,
              frontBiasedArc(index * gap + (elapsed / ORBIT_PERIOD_SECONDS) * table.total, table.total),
            );

            let px = Math.sin(ang) * rxEff;
            let py = -Math.cos(ang) * ryEff;
            const depth = (py + ryEff) / (2 * ryEff);

            // Radius must mirror DomainPlanet's own depth scale, otherwise
            // papers judge a large front planet by a small flat radius and
            // sail well inside it before vanishing.
            const depthScale = 0.52 + 0.73 * Math.pow(depth, 1.6);
            naturalPositions.push({
              id: domain.id,
              x: px,
              y: py,
              radius: (dotSize / 2) * depthScale,
            });

            const isFocused = selectedId === domain.id;
            const isFaded = selectedId !== null ? !isFocused : hoveredId !== null && hoveredId !== domain.id;

            if (selectedId !== null) {
              if (isFocused) {
                if (entered) {
                  // Enter clicked: slide from the empty center out to the
                  // top-right, clearing the left side for the paper list.
                  px = topRightX;
                  py = topRightY;
                } else {
                  // Selected but not yet entered: into the empty center.
                  px = 0;
                  py = 0;
                }
              } else {
                // The remaining nine are laid back out EVENLY, by arc length,
                // across the whole ring minus a clearance gap either side of
                // where the focused planet was. Redistributing by *angle*
                // (the previous attempt) is what made them pile up on top of
                // each other: on a ring this flat, equal angle steps are very
                // unequal distances — points bunch hard near the left/right
                // extremes. Working in arc length is the same reason the
                // normal layout uses angleAtArc, and it guarantees identical
                // spacing between every neighbour here too.
                const order = (index - selectedIndex + count) % count; // 1..count-1
                const pushedAng = angleAtArc(
                  table,
                  frontBiasedArc(sFocus + focusClear + (order - 1) * focusStep, table.total),
                );
                px = Math.sin(pushedAng) * rxEff;
                py = -Math.cos(pushedAng) * ryEff;
              }
            }

            return (
              <DomainPlanet
                key={domain.id}
                domain={domain}
                x={px}
                y={py}
                size={dotSize}
                depth={depth}
                isFocused={isFocused}
                isHovered={hoveredId === domain.id}
                isFaded={isFaded}
                reducedMotion={reducedMotion}
                onHoverStart={() => selectedId === null && setHoveredId(domain.id)}
                onHoverEnd={() => setHoveredId((cur) => (cur === domain.id ? null : cur))}
                onSelect={() => handleSelect(isFocused ? null : domain.id)}
              />
            );
          });

          return (
            <>
              {/* Behind every planet (z-index 3 vs. 10+): papers drifting in
                  from the edges and being pulled into their assigned
                  planet, tracking its live position as it orbits. */}
              {!reducedMotion && (
                <PaperAttractionField
                  planets={naturalPositions}
                  elapsed={elapsed}
                  containerWidth={containerWidth}
                  containerHeight={containerHeight}
                  hidden={selectedId !== null}
                />
              )}
              {planetElements}
            </>
          );
        })()}

        <AnimatePresence>
          {selected && !entered && <DomainFocus key={selected.id} radius={focusedRadius} onEnter={handleEnter} />}
        </AnimatePresence>

        {/* No "back" button in either focused stage — clicking anywhere in
            the background exits back to the universe instead. Sits above
            every non-focused planet (max z-index 100) and the drawn orbit
            line, but below the focused planet (200), the Enter button (110)
            and the paper panel (105), so those stay directly
            clickable/scrollable as normal. */}
        <AnimatePresence>
          {selected && (
            <motion.button
              key="exit-backdrop"
              type="button"
              aria-label="Exit principle view"
              onClick={() => handleSelect(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="absolute inset-0 z-[104] cursor-pointer"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selected && entered && (
            <PrinciplePapersPanel key={selected.id} papers={papers} maxHeight={containerHeight} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MobileDomainList({
  selectedId,
  onSelect,
  entered,
  onEnter,
}: {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  entered: boolean;
  onEnter: () => void;
}) {
  return (
    <div className="mx-auto max-w-md">
      <AnimatePresence initial={false}>
        {selectedId !== null && (
          <motion.button
            type="button"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={() => onSelect(null)}
            className="mb-4 flex items-center gap-1.5 overflow-hidden text-xs font-semibold text-zinc-500 dark:text-zinc-400"
          >
            <ArrowLeft size={13} />
            Back to all domains
          </motion.button>
        )}
      </AnimatePresence>

      <ul className="space-y-2.5">
        {ethicalAiDomains.map((domain) => {
          const isOpen = selectedId === domain.id;
          const isDimmed = selectedId !== null && !isOpen;
          return (
            <motion.li
              key={domain.id}
              layout
              animate={{ opacity: isDimmed ? 0.45 : 1 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <button
                type="button"
                onClick={() => onSelect(isOpen ? null : domain.id)}
                aria-expanded={isOpen}
                aria-label={domain.title}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span aria-hidden="true" className="relative size-7 shrink-0">
                  <PlanetOrb domainId={domain.id} emphasized={isOpen} />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-zinc-700 dark:text-zinc-200">
                  {domain.title}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{domain.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {domain.description}
                      </p>

                      {!entered ? (
                        <button
                          type="button"
                          onClick={onEnter}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-icaire-600 px-4 py-1.5 text-xs font-semibold text-white dark:bg-icaire-500"
                        >
                          Enter
                          <ChevronRight size={13} />
                        </button>
                      ) : (
                        <MobilePapersList domain={domain} />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/** Mobile equivalent of PrinciplePapersPanel — same title-only, link-only
 * list, just inline within the accordion panel instead of a floating
 * left-hand column. */
function MobilePapersList({ domain }: { domain: EthicalAiDomain }) {
  const papers = getPapersForPrinciple(`P${domain.number}`);
  if (papers.length === 0) {
    return <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">No papers indexed under this principle yet.</p>;
  }
  return (
    <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      {papers.map((paper, i) => (
        <li key={i}>
          <a
            href={paper.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-1.5 py-0.5 text-sm leading-snug text-zinc-600 dark:text-zinc-300"
          >
            <ExternalLink size={12} className="mt-1 shrink-0 opacity-40 group-hover:opacity-100" />
            <span>{paper.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
