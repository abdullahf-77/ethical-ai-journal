import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { CentersIntro } from "../components/centers/CentersIntro";
import { FibonacciSpiralBackground } from "../components/centers/FibonacciSpiralBackground";
import { GroupCluster } from "../components/centers/GroupCluster";
import { CrumplePaperTransition } from "../components/centers/CrumplePaperTransition";
import { GroupRegionView } from "../components/centers/GroupRegionView";
import { clusterPositions } from "../lib/spiral";
import centersData from "../data/centers.json";
import groupsData from "../data/centerGroups.json";
import type { Center, CenterGroup, CenterGroupId } from "../types";

const EASE = [0.16, 1, 0.3, 1] as const;
const centers = centersData as Center[];
const groups = groupsData as CenterGroup[];

type Stage = "globe" | "pulling" | "morphing" | "clusters" | "region";

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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return isMobile;
}

export function CentersPage() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(760);

  const [stage, setStage] = useState<Stage>("globe");
  const [selectedGroupId, setSelectedGroupId] = useState<CenterGroupId | null>(null);
  const [hoveredGroupId, setHoveredGroupId] = useState<CenterGroupId | null>(null);
  const [transitionOrigin, setTransitionOrigin] = useState<{ x: number; y: number } | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<"in" | "out" | null>(null);

  const centersByGroup = useMemo(() => {
    const map = new Map<CenterGroupId, Center[]>();
    for (const g of groups) map.set(g.id, centers.filter((c) => c.group === g.id));
    return map;
  }, []);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  // Auto-advance the one-time intro sequence. Skipped entirely on mobile
  // (a simple list replaces the animated scene there) and for
  // prefers-reduced-motion, both of which jump straight to "clusters".
  useEffect(() => {
    if (reducedMotion || isMobile) {
      setStage("clusters");
      return;
    }
    const t1 = setTimeout(() => setStage("pulling"), 1200);
    const t2 = setTimeout(() => setStage("morphing"), 2600);
    const t3 = setTimeout(() => setStage("clusters"), 3700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reducedMotion, isMobile]);

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

  const dotSize = Math.min(112, containerWidth * 0.12);
  const positions = useMemo(() => {
    const pts = clusterPositions(groups.length, { a: containerWidth * 0.11, startAngle: -100 });
    const map = new Map<CenterGroupId, { x: number; y: number }>();
    groups.forEach((g, i) => map.set(g.id, { x: pts[i].x, y: pts[i].y }));
    return map;
  }, [containerWidth]);

  function screenPosFor(dx: number, dy: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return { x: rect.left + rect.width / 2 + dx, y: rect.top + rect.height / 2 + dy };
  }

  function handleSelectGroup(id: CenterGroupId) {
    const pos = positions.get(id);
    if (pos) setTransitionOrigin(screenPosFor(pos.x, pos.y));
    setTransitionDirection(reducedMotion ? null : "in");
    setSelectedGroupId(id);
    setStage("region");
  }

  function handleBack() {
    if (selectedGroupId) {
      const pos = positions.get(selectedGroupId);
      if (pos) setTransitionOrigin(screenPosFor(pos.x, pos.y));
    }
    setTransitionDirection(reducedMotion ? null : "out");
    setStage("clusters");
  }

  return (
    <div className="relative pb-10">
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-8 text-center sm:px-8 sm:pt-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
            Centers Hub
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            AI ethics centers around the world
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Grouped by UNESCO&rsquo;s six electoral regions. Select a group to see the countries and
            research centers within it.
          </p>
        </Reveal>
      </div>

      {isMobile ? (
        <MobileGroupList centersByGroup={centersByGroup} />
      ) : (
        <div className="relative px-6 sm:px-8">
          <div ref={containerRef} className="relative mx-auto mt-4 aspect-square w-full max-w-[760px]">
            <FibonacciSpiralBackground visible={stage === "morphing" || stage === "clusters" || stage === "region"} />

            {(stage === "globe" || stage === "pulling" || stage === "morphing") && (
              <CentersIntro stage={stage} reducedMotion={reducedMotion} />
            )}

            <motion.div
              className="absolute inset-0"
              style={{ pointerEvents: stage === "clusters" ? "auto" : "none" }}
              animate={{ opacity: stage === "clusters" ? 1 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {groups.map((g) => {
                const pos = positions.get(g.id)!;
                return (
                  <GroupCluster
                    key={g.id}
                    group={g}
                    centerCount={centersByGroup.get(g.id)?.length ?? 0}
                    countryCount={g.countryCodes.length}
                    x={pos.x}
                    y={pos.y}
                    size={dotSize}
                    isHovered={hoveredGroupId === g.id}
                    isFaded={hoveredGroupId !== null && hoveredGroupId !== g.id}
                    reducedMotion={reducedMotion}
                    onHoverStart={() => setHoveredGroupId(g.id)}
                    onHoverEnd={() => setHoveredGroupId((cur) => (cur === g.id ? null : cur))}
                    onSelect={() => handleSelectGroup(g.id)}
                  />
                );
              })}
            </motion.div>
          </div>

          {stage === "region" && selectedGroup && (
            <div className="relative z-10 bg-white dark:bg-[#0a0a0d]">
              <GroupRegionView
                group={selectedGroup}
                centers={centersByGroup.get(selectedGroup.id) ?? []}
                onBack={handleBack}
              />
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {transitionDirection && transitionOrigin && (
          <CrumplePaperTransition
            origin={transitionOrigin}
            direction={transitionDirection}
            reducedMotion={reducedMotion}
            onComplete={() => setTransitionDirection(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileGroupList({ centersByGroup }: { centersByGroup: Map<CenterGroupId, Center[]> }) {
  const [openId, setOpenId] = useState<CenterGroupId | null>(null);

  return (
    <div className="mx-auto max-w-md px-6">
      <ul className="space-y-2.5">
        {groups.map((g) => {
          const groupCenters = centersByGroup.get(g.id) ?? [];
          const isOpen = openId === g.id;
          return (
            <li key={g.id} className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : g.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {g.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug text-zinc-700 dark:text-zinc-200">
                    {g.label}
                  </span>
                  <span className="block text-xs text-zinc-400 dark:text-zinc-500">{g.regionName}</span>
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
                    transition={{ duration: 0.25, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1 px-4 pb-4">
                      {groupCenters.map((c) => (
                        <li key={c.id} className="rounded-lg px-2 py-2 text-xs">
                          <p className="font-medium text-zinc-700 dark:text-zinc-200">{c.name}</p>
                          <p className="mt-0.5 text-zinc-400 dark:text-zinc-500">
                            {c.city !== "National" ? `${c.city}, ` : ""}
                            {c.country}
                          </p>
                          {c.website && (
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 inline-block text-icaire-700 underline dark:text-icaire-400"
                            >
                              {c.website.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
