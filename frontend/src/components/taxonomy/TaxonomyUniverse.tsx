import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import type { EthicalAiDomain } from "../../data/ethicalAiDomains";
import { ethicalAiDomains } from "../../data/ethicalAiDomains";
import { DomainPlanet } from "./DomainPlanet";
import { PlanetOrb } from "./PlanetOrb";
import { DomainFocus } from "./DomainFocus";
import { PaperAttractionField } from "./PaperAttractionField";
import { PapersExplorer, PrinciplePapersPanel } from "./PrinciplePapersPanel";
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

/** How large the focused orb grows, as a multiple of its normal size.
 * Brought down from 2.6 — at that size the focused circle dwarfed the rest
 * of the scene once the container was made tall enough to actually show all
 * of it (previously it was large enough to overflow the short container and
 * get visually clipped, which is why it hadn't read as oversized before).
 * 1.9 still clears the longest title + description comfortably (see the
 * scale-invariant note in DomainPlanet) while reading as far less
 * dominant. */
const FOCUS_SCALE = 1.9;

/** The SVG's viewBox must keep the SAME aspect ratio as the container
 * (see the aspect-[16/9] class below), otherwise preserveAspectRatio
 * letterboxes the drawing and the dashed line stops matching the orbit the
 * planets actually travel. Changing one means changing the other.
 *
 * This box is now a single FIXED ratio in every state. It used to grow from
 * 16/7.2 to 16/12 the moment a planet was selected, and because the box is in
 * normal page flow that height change relayed the whole document — everything
 * below shifted, the page got taller, and on viewports near the threshold the
 * window's scrollbar appeared and disappeared, which changed the viewport
 * width and re-laid-out the scene again. That feedback loop is what read as
 * the page "shaking" on click. 16/9 is tall enough to hold the focused orb and
 * the expanded ring without ever resizing. */
const VIEWBOX_W = 1600;
const VIEWBOX_H = 900;

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

/** A slow, pausable clock in elapsed seconds. Ticks every animation frame
 * (was throttled to 30fps) — the planets' own long eased framer-motion
 * tween hid the coarser sampling well, but the papers in
 * PaperAttractionField interpolate with a much shorter, near-linear CSS
 * transition to preserve their constant-speed motion, and at 30fps that
 * transition window was wide enough relative to the gap between samples to
 * read as a visible stutter rather than smooth drift. Full frame-rate
 * sampling is cheap (a handful of trig calls for 10 planets + 30 papers)
 * and removes the stutter without changing either's motion model. */
function useOrbitClock(paused: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) {
      lastRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setElapsed((e) => e + dt);
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

  // Bring the focused planet into view instead of leaving it wherever the
  // page happened to be scrolled — both when a planet is first selected and
  // again once "Enter" moves it to the top-right, since the container grows
  // taller for both (see the aspect-ratio class below) and the interesting
  // part can otherwise land below the fold. Delayed to just past the
  // container's own 300ms grow transition, so the scroll lands on the
  // final (tall) layout rather than the short one mid-grow.
  //
  // Scrolled to the TOP of the container (with a little breathing room)
  // rather than centered: at the grown height this box can be taller than
  // the viewport itself on shorter screens, and in both focused stages the
  // content that actually matters — the enlarged planet in the center
  // stage, the top-right planet and the paper list in the entered stage —
  // all sits in the upper portion of the box. Centering would split that
  // overflow evenly and risk cropping the top just as often as the bottom;
  // anchoring the top guarantees the important part is visible and leaves
  // any overflow to the mostly-empty space below.
  // Only `selectedId` is a dependency — NOT `entered`. Previously both were,
  // so a single click-then-Enter fired two smooth scrolls a few hundred ms
  // apart, the second interrupting the first mid-flight; combined with the
  // container's old height animation that was a second, independent source of
  // the "shaking" on selection. The container no longer changes size at all,
  // so entering a principle needs no scroll correction — one scroll, on
  // selection, is enough.
  //
  // It's also a no-op when the scene is already comfortably in view, so
  // clicking a planet on an already-scrolled-to-place page doesn't nudge
  // everything for no reason.
  useEffect(() => {
    if (selectedId === null) return;
    const id = window.setTimeout(
      () => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const alreadyVisible = rect.top >= -8 && rect.top <= 96;
        if (alreadyVisible) return;
        window.scrollTo({
          top: rect.top + window.scrollY - 24,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      reducedMotion ? 0 : 60,
    );
    return () => window.clearTimeout(id);
  }, [selectedId, reducedMotion]);

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    setHoveredId(null);
    setEntered(false);
  };
  const handleEnter = () => setEntered(true);

  if (viewport === "mobile") {
    return (
      <MobileDomainList
        selectedId={selectedId}
        onSelect={handleSelect}
        entered={entered}
        onEnter={handleEnter}
        reducedMotion={reducedMotion}
      />
    );
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
  // Its on-screen radius doesn't change (DomainPlanet's focus scale is the
  // same FOCUS_SCALE in both states — see the isFocused branch below), so
  // the anchor only needs to keep that same-sized orb clear of the
  // container's top and right edges.
  const focusedRadius = (dotSize * FOCUS_SCALE) / 2;
  const EDGE_PAD = 20;
  const topRightX = containerWidth / 2 - focusedRadius - EDGE_PAD;
  const topRightY = -(containerHeight / 2 - focusedRadius - EDGE_PAD);

  return (
    // overflow-x-clip: while a principle is focused the ring grows by
    // FOCUS_RING_SCALE and the pushed-out planets extend past this wrapper,
    // which gave the whole PAGE a horizontal scrollbar — and any horizontal
    // scroll then slid the absolutely-positioned papers panel partly off the
    // left edge. Clipping horizontally here contains the overspill without
    // creating a scroll container (unlike overflow-hidden) and without
    // touching the ring math or any planet interaction.
    <div className="relative overflow-x-clip">
      {/* aspect-[16/7.2] matches VIEWBOX_W / VIEWBOX_H exactly — keep them in
          sync. The ring is only as tall as 2 * ry, so the old 16/8.8 box left
          a wide empty band above (and below) it; trimming the box's height
          lifts the whole orbit up under the copy without touching rx, ry or
          the planet size, all of which derive from the container's WIDTH. */}
      <div
        ref={containerRef}
        // ONE fixed aspect ratio in every state — see the VIEWBOX note above.
        // The box is sized once for the largest thing it ever has to hold (the
        // focused orb plus the ring at FOCUS_RING_SCALE) so that selecting,
        // entering and exiting a principle are pure transform/opacity changes
        // inside a container whose own geometry never moves. That also keeps
        // the exit-backdrop's `inset-0` coverage and the entered stage's
        // top-right anchor valid at all times, which is what the old growing
        // box was introduced to fix — without the layout shift it caused.
        className="relative mx-auto mt-1 aspect-[16/9] w-full max-w-[820px] lg:max-w-[1180px]"
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
                focusScale={FOCUS_SCALE}
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

        {/* Rendered plainly rather than through AnimatePresence, and with no
            exit animation on the panel itself. A principle can hold 200+
            papers, and keeping an outgoing panel alive to animate it away
            doubles several thousand DOM nodes mid-switch; worse, exit
            bookkeeping here proved fragile — the panel would finish its exit
            transition and then never be removed, leaving a zombie list at
            opacity 0 that blocked the next principle from ever mounting.
            Mounting/unmounting outright is both cheaper and deterministic; the
            panel still animates IN via its own initial/animate, and the rows
            inside still cross-fade on principle and filter changes. */}
        {selected && entered && (
          <PrinciplePapersPanel
            key={selected.id}
            papers={papers}
            maxHeight={containerHeight}
            reducedMotion={reducedMotion}
          />
        )}
      </div>
    </div>
  );
}

function MobileDomainList({
  selectedId,
  onSelect,
  entered,
  onEnter,
  reducedMotion,
}: {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  entered: boolean;
  onEnter: () => void;
  reducedMotion: boolean;
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
                        <MobilePapersList domain={domain} reducedMotion={reducedMotion} />
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

/** Mobile equivalent of PrinciplePapersPanel — the same PapersExplorer
 * (filters, numbered rows, tag chips, show more) as the desktop panel, just
 * flowing inline within the accordion instead of floating in a card, since
 * there's no planet to float alongside on a narrow screen. */
function MobilePapersList({ domain, reducedMotion }: { domain: EthicalAiDomain; reducedMotion: boolean }) {
  const papers = getPapersForPrinciple(`P${domain.number}`);
  return (
    <PapersExplorer
      papers={papers}
      reducedMotion={reducedMotion}
      className="-mx-4 mt-3 border-t border-zinc-100 dark:border-zinc-800"
    />
  );
}
