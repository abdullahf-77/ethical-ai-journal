import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Center, CenterGroup, CenterGroupId } from "../../types";
import { RegionMap } from "./RegionMap";
import { CenterCard } from "./CenterCard";

const EASE = [0.16, 1, 0.3, 1] as const;

const GROUP_DESCRIPTIONS: Record<CenterGroupId, string> = {
  I: "Universities, national research institutes, and independent think tanks across Western Europe and North America — the largest concentration of dedicated AI-ethics centers in this dataset.",
  II: "A smaller but growing network of academic ethics centers across Eastern Europe, several with an explicit dedicated AI-ethics research program.",
  III: "Academic and independent institutes across Latin America and the Caribbean working on AI governance, ethics, and public-sector policy.",
  IV: "A wide span from South and East Asia to Australia, New Zealand, and the Pacific — university labs, government-linked institutes, and independent research studios.",
  Va: "Government-linked and university-affiliated centers advancing AI ethics research and governance frameworks across the Arab States.",
  Vb: "A growing network of African university labs, independent institutes, and government-linked centers working on AI ethics, governance, and human rights.",
};

export function GroupRegionView({
  group,
  centers,
  onBack,
}: {
  group: CenterGroup;
  centers: Center[];
  onBack: () => void;
}) {
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const selectedCenter = centers.find((c) => c.id === selectedCenterId) ?? null;

  const countriesWithCenters = useMemo(() => new Set(centers.map((c) => c.countryCode)).size, [centers]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="relative mx-auto max-w-6xl px-6 pb-16 pt-8 sm:px-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-semibold text-zinc-600 backdrop-blur-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <ArrowLeft size={13} />
        Back to all groups
      </button>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <RegionMap group={group} centers={centers} selectedCenterId={selectedCenterId} onSelectCenter={setSelectedCenterId} />

        <div className="rounded-3xl border border-zinc-200 p-6 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
            {group.label}
          </p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {group.regionName}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {GROUP_DESCRIPTIONS[group.id]}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Centers</dt>
              <dd className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{centers.length}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Countries represented
              </dt>
              <dd className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {countriesWithCenters} / {group.countryCodes.length}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
            Solid countries have at least one listed center — the rest of {group.regionName} is shown
            striped, since not every country in the region is represented yet.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedCenter && <CenterCard center={selectedCenter} onClose={() => setSelectedCenterId(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
