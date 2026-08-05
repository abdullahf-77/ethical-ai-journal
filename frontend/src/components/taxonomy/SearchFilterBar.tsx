import { Search, X, ArrowDownAZ, FileStack } from "lucide-react";

export type SortMode = "default" | "papers";
export type ViewMode = "cards" | "explorer";

const quickFilters = [
  { label: "All", query: "" },
  { label: "Rights & Fairness", query: "rights" },
  { label: "Privacy", query: "privacy" },
  { label: "Security", query: "security" },
  { label: "Safety & Oversight", query: "safety" },
  { label: "Governance", query: "governance" },
  { label: "Society", query: "societal" },
  { label: "Content Integrity", query: "content" },
];

const sortOptions: { mode: SortMode; label: string; icon: typeof ArrowDownAZ }[] = [
  { mode: "default", label: "Default order", icon: ArrowDownAZ },
  { mode: "papers", label: "Most papers", icon: FileStack },
];

const viewOptions: { mode: ViewMode; label: string }[] = [
  { mode: "cards", label: "Cards" },
  { mode: "explorer", label: "Explorer" },
];

export function SearchFilterBar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  sort: SortMode;
  onSortChange: (v: SortMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}) {
  return (
    <div className="sticky top-[64px] z-30 -mx-6 border-b border-zinc-200/70 bg-white/80 px-6 py-4 backdrop-blur-lg dark:border-zinc-800/70 dark:bg-[#0a0a0d]/80 sm:-mx-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {viewMode === "cards" && (
            <>
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  type="text"
                  placeholder="Search domains, subdomains, or paper titles — e.g. “bias”, “prompt injection”, “disclosure”..."
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50/70 py-2.5 pl-11 pr-10 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-colors focus:border-icaire-400 focus:bg-white focus:ring-4 focus:ring-icaire-500/10 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:focus:border-icaire-500 dark:focus:bg-zinc-900"
                />
                {query && (
                  <button
                    onClick={() => onQueryChange("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50/70 p-1 dark:border-zinc-700 dark:bg-zinc-900/60">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => onSortChange(opt.mode)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      sort === opt.mode
                        ? "bg-icaire-600 text-white dark:bg-icaire-500"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                  >
                    <opt.icon size={12} />
                    <span className="hidden md:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50/70 p-1 dark:border-zinc-700 dark:bg-zinc-900/60">
            {viewOptions.map((opt) => (
              <button
                key={opt.mode}
                type="button"
                onClick={() => onViewModeChange(opt.mode)}
                aria-pressed={viewMode === opt.mode}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === opt.mode
                    ? "bg-icaire-600 text-white dark:bg-icaire-500"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "cards" && (
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
            {quickFilters.map((f) => {
              const active = query.toLowerCase() === f.query.toLowerCase() && (f.query !== "" || query === "");
              return (
                <button
                  key={f.label}
                  onClick={() => onQueryChange(f.query)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-icaire-500 bg-icaire-500/10 text-icaire-700 dark:text-icaire-300"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
