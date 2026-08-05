import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Hand, MousePointerClick } from "lucide-react";
import { ethicalAiDomains } from "../../data/ethicalAiDomains";
import { TaxonomyOrb } from "./TaxonomyOrb";
import { DomainPlanet } from "./DomainPlanet";
import { DomainFocus } from "./DomainFocus";

const EASE = [0.16, 1, 0.3, 1] as const;

type Viewport = "mobile" | "tablet" | "desktop";

// The row itself is static — no shared path, no idle circular motion around
// a center. Planets only move in response to a direct interaction: the
// small hover scale-up, and the click-to-focus rise/part-sideways below.

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

export function TaxonomyUniverse() {
  const viewport = useViewport();
  const reducedMotion = usePrefersReducedMotion();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = selectedId != null ? ethicalAiDomains.find((d) => d.id === selectedId) ?? null : null;
  const selectedIndex = selectedId != null ? ethicalAiDomains.findIndex((d) => d.id === selectedId) : -1;

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    setHoveredId(null);
  };

  if (viewport === "mobile") {
    return <MobileDomainList selectedId={selectedId} onSelect={handleSelect} />;
  }

  const dotSize = viewport === "desktop" ? 46 : 38;
  const riseAmount = viewport === "desktop" ? 100 : 78;

  return (
    <div className="relative mx-auto max-w-5xl lg:max-w-6xl">
      <div className="mb-10 sm:mb-14">
        <TaxonomyOrb dimmed={selectedId !== null} />
      </div>

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

      <div className="relative mt-14 sm:mt-16">
        <div className="relative flex items-start justify-between gap-2 px-1 sm:gap-3 lg:gap-4">
          {ethicalAiDomains.map((domain, index) => {
            let x = 0;
            let y = 0;

            const isFocused = selectedId === domain.id;
            const isFaded = selectedId !== null ? !isFocused : hoveredId !== null && hoveredId !== domain.id;

            if (selectedId !== null) {
              if (isFocused) {
                x = 0;
                y = -riseAmount;
              } else {
                const distance = index - selectedIndex;
                const dir = distance === 0 ? 0 : distance / Math.abs(distance);
                x = dir * Math.min(64, Math.abs(distance) * 15);
              }
            }

            return (
              <DomainPlanet
                key={domain.id}
                domain={domain}
                x={x}
                y={y}
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
        </div>
      </div>

      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            key="focus"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <DomainFocus domain={selected} onBack={() => handleSelect(null)} />
          </motion.div>
        )}
      </AnimatePresence>
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
                  className="size-6 shrink-0 rounded-full bg-icaire-700 ring-1 ring-inset ring-white/25 dark:bg-icaire-400 dark:ring-black/20"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold tracking-wider text-icaire-600 dark:text-icaire-400">
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
