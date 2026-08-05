import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Hand, MousePointerClick } from "lucide-react";
import { ethicalAiDomains } from "../../data/ethicalAiDomains";
import { DomainPlanet } from "./DomainPlanet";
import { PlanetOrb } from "./PlanetOrb";
import { DomainFocus } from "./DomainFocus";

const EASE = [0.16, 1, 0.3, 1] as const;

type Viewport = "mobile" | "tablet" | "desktop";

/** One shared elliptical path for all ten domains. They are spaced evenly
 * (360/10 = 36 degrees apart) and advance together at a single slow speed,
 * so their relative spacing is fixed forever and they can never collide or
 * overlap each other's labels. */
const ORBIT_PERIOD_SECONDS = 240;
const STEP_DEGREES = 360 / ethicalAiDomains.length;

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

/** A slow, pausable clock in elapsed seconds. Throttled to ~15fps — at this
 * orbit speed anything faster is wasted work. */
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
      if (accRef.current >= 1 / 15) {
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
  const viewport = useViewport();
  const reducedMotion = usePrefersReducedMotion();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // The whole system pauses while a domain is hovered or focused. The clock
  // holds its last value while paused, so positions simply freeze in place.
  const paused = selectedId !== null || hoveredId !== null || reducedMotion;
  const elapsed = useOrbitClock(paused);

  const selected = selectedId != null ? ethicalAiDomains.find((d) => d.id === selectedId) ?? null : null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    setHoveredId(null);
  };

  if (viewport === "mobile") {
    return <MobileDomainList selectedId={selectedId} onSelect={handleSelect} />;
  }

  // Wide, flattened ellipse — a side-on view of the system.
  const halfW = containerWidth / 2;
  const halfH = (containerWidth * (14 / 16)) / 2;
  const rx = halfW * 0.78;
  const ry = halfH * 0.72;
  // Sized to fit the longest principle title inside the orb: "Multi-
  // stakeholder and Adaptive Governance and Collaboration" needs roughly a
  // 115px text box at 12px type, and the inscribed box is 72% of the
  // diameter. The closest two planets sit 0.618 * ry apart — 210px desktop,
  // 171px tablet — which clears these diameters at the 1.1x hover scale.
  const dotSize = viewport === "desktop" ? 160 : 132;

  return (
    <div className="relative">
      <div className="text-center">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-4 py-1.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <Hand size={13} className="text-icaire-600 dark:text-icaire-400" />
            Hover a planet to explore
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick size={13} className="text-icaire-600 dark:text-icaire-400" />
            Click a planet to focus
          </span>
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto mt-8 aspect-[16/14] w-full max-w-[880px] lg:max-w-[1080px]"
      >
        {/* the shared path itself — one faint dashed ellipse, using the same
            broken-line treatment as the flow lines in the Hero artwork */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-icaire-700/[0.32] dark:text-icaire-400/[0.4]"
          viewBox="0 0 1600 1400"
          aria-hidden="true"
        >
          <ellipse
            cx="800"
            cy="700"
            rx={0.78 * 800}
            ry={0.72 * 700}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="9 13"
          />
        </svg>

        {ethicalAiDomains.map((domain, index) => {
          const angleDeg = index * STEP_DEGREES + elapsed * (360 / ORBIT_PERIOD_SECONDS);
          const rad = (angleDeg * Math.PI) / 180;

          let px = Math.sin(rad) * rx;
          let py = -Math.cos(rad) * ry;

          const isFocused = selectedId === domain.id;
          const isFaded = selectedId !== null ? !isFocused : hoveredId !== null && hoveredId !== domain.id;

          if (selectedId !== null) {
            if (isFocused) {
              // into the empty center
              px = 0;
              py = 0;
            } else {
              // pushed outward toward the edges
              px *= 1.2;
              py *= 1.2;
            }
          }

          return (
            <DomainPlanet
              key={domain.id}
              domain={domain}
              x={px}
              y={py}
              size={dotSize}
              isFocused={isFocused}
              isHovered={hoveredId === domain.id}
              isFaded={isFaded}
              reducedMotion={reducedMotion}
              onHoverStart={() => selectedId === null && setHoveredId(domain.id)}
              onHoverEnd={() => setHoveredId((cur) => (cur === domain.id ? null : cur))}
              onSelect={() => handleSelect(isFocused ? null : domain.id)}
            />
          );
        })}

        <AnimatePresence>
          {selected && <DomainFocus key={selected.id} domain={selected} onBack={() => handleSelect(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MobileDomainList({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
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
                  <PlanetOrb />
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
