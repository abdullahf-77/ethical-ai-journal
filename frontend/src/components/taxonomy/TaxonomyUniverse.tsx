import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { ethicalAiDomains } from "../../data/ethicalAiDomains";
import { TaxonomyOrb } from "./TaxonomyOrb";
import { DomainPlanet, type LabelPlacement } from "./DomainPlanet";
import { DomainFocus } from "./DomainFocus";

const EASE = [0.16, 1, 0.3, 1] as const;

type Viewport = "mobile" | "tablet" | "desktop";

/** Per-domain orbit shape: starting angle (0 = top, clockwise), distance
 * from center as a ratio of the available radius, revolution period in
 * seconds, and rotation direction. Deliberately varied so the system
 * doesn't read as one mechanical ring. */
const ORBIT_CONFIG: Record<number, { angle: number; radiusRatio: number; period: number; dir: 1 | -1 }> = {
  1: { angle: 0, radiusRatio: 0.94, period: 92, dir: 1 },
  2: { angle: 36, radiusRatio: 0.8, period: 108, dir: -1 },
  3: { angle: 72, radiusRatio: 0.97, period: 84, dir: 1 },
  4: { angle: 108, radiusRatio: 0.82, period: 118, dir: -1 },
  5: { angle: 144, radiusRatio: 0.92, period: 98, dir: 1 },
  6: { angle: 180, radiusRatio: 0.8, period: 104, dir: -1 },
  7: { angle: 216, radiusRatio: 0.97, period: 88, dir: 1 },
  8: { angle: 252, radiusRatio: 0.8, period: 112, dir: -1 },
  9: { angle: 288, radiusRatio: 0.94, period: 94, dir: 1 },
  10: { angle: 324, radiusRatio: 0.82, period: 106, dir: -1 },
};

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

/** A slow, pausable clock (in elapsed seconds) driving the orbit animation.
 * Re-renders are throttled to ~15fps — the motion is subtle enough that
 * higher frequency updates would be wasted work. */
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

function labelPlacementFor(nx: number, ny: number): LabelPlacement {
  if (Math.abs(nx) > 0.55) return nx > 0 ? "right" : "left";
  return ny < 0 ? "top" : "bottom";
}

export function TaxonomyUniverse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const viewport = useViewport();
  const reducedMotion = usePrefersReducedMotion();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const frozenElapsedRef = useRef<Record<number, number>>({});

  const paused = selectedId !== null || reducedMotion;
  const elapsed = useOrbitClock(paused);

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

  const selected = selectedId != null ? ethicalAiDomains.find((d) => d.id === selectedId) ?? null : null;

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    setHoveredId(null);
  };

  if (viewport === "mobile") {
    return <MobileDomainList selectedId={selectedId} onSelect={handleSelect} />;
  }

  const half = containerWidth / 2;
  const maxRadius = half * 0.78;
  const dotSize = viewport === "desktop" ? 26 : 22;
  const focusOffsetY = -Math.min(92, half * 0.3);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative mx-auto aspect-square w-full max-w-[460px] sm:max-w-[560px] lg:max-w-[660px]"
      >
        <div
          className="pointer-events-none absolute inset-[9%] rounded-full border border-zinc-300/35 dark:border-zinc-700/30"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-[24%] rounded-full border border-zinc-300/25 dark:border-zinc-700/20"
          aria-hidden="true"
        />

        <TaxonomyOrb dimmed={selectedId !== null} />

        {ethicalAiDomains.map((domain) => {
          const cfg = ORBIT_CONFIG[domain.id];

          let domainElapsed = elapsed;
          if (selectedId === null && hoveredId === domain.id) {
            if (frozenElapsedRef.current[domain.id] === undefined) {
              frozenElapsedRef.current[domain.id] = elapsed;
            }
            domainElapsed = frozenElapsedRef.current[domain.id];
          } else {
            frozenElapsedRef.current[domain.id] = elapsed;
          }

          const angleDeg = cfg.angle + domainElapsed * cfg.dir * (360 / cfg.period);
          const rad = (angleDeg * Math.PI) / 180;
          const nx = Math.sin(rad);
          const ny = -Math.cos(rad);
          const radiusPx = cfg.radiusRatio * maxRadius;

          let px = nx * radiusPx;
          let py = ny * radiusPx;

          const isFocused = selectedId === domain.id;
          const isFaded = selectedId !== null ? !isFocused : hoveredId !== null && hoveredId !== domain.id;

          if (selectedId !== null) {
            if (isFocused) {
              px = 0;
              py = focusOffsetY;
            } else {
              const cap = half * 0.92;
              const mag = Math.hypot(px, py) || 1;
              const pushed = Math.min(mag * 1.24, cap);
              px = (px / mag) * pushed;
              py = (py / mag) * pushed;
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
              showLabel
              labelPlacement={labelPlacementFor(nx, ny)}
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
                <span
                  aria-hidden="true"
                  className="size-6 shrink-0 rounded-full border border-white/40 dark:border-white/10"
                  style={{ background: `linear-gradient(145deg, ${domain.color.from}, ${domain.color.to})` }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500">
                    {domain.number}
                  </span>
                  <span className="block truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {domain.shortLabel.filter(Boolean).join(" ")}
                  </span>
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
