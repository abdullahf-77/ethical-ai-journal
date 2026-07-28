import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  ArrowDownAZ,
  FileStack,
  Network,
  Layers,
  FileText,
  SearchX,
} from "lucide-react";
import type { Taxonomy, Paper } from "../../types";
import { searchAll } from "../../lib/search";

export type SortMode = "default" | "papers" | "subdomains";

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
  { mode: "subdomains", label: "Most subdomains", icon: Network },
];

export function SearchFilterBar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  taxonomy,
  papers,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  sort: SortMode;
  onSortChange: (v: SortMode) => void;
  taxonomy: Taxonomy;
  papers: Paper[];
}) {
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => searchAll(query, taxonomy, papers, 5), [query, taxonomy, papers]);
  const hasResults = results.domains.length + results.subdomains.length + results.papers.length > 0;
  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="sticky top-[64px] z-30 -mx-6 border-b border-zinc-200/70 bg-white/80 px-6 py-4 backdrop-blur-lg dark:border-zinc-800/70 dark:bg-[#0a0a0d]/80 sm:-mx-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              type="text"
              placeholder="Search domains, subdomains, papers, or abstracts — e.g. “bias”, “prompt injection”, “disclosure”..."
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

            {showDropdown && (
              <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                {!hasResults ? (
                  <div className="flex items-center gap-2 px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
                    <SearchX size={16} />
                    No matches for &ldquo;{query}&rdquo;.
                  </div>
                ) : (
                  <>
                    {results.domains.length > 0 && (
                      <ResultGroup label="Domains" icon={Layers}>
                        {results.domains.map((r) => (
                          <Link
                            key={r.id}
                            to={`/taxonomy/${r.id}`}
                            className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-icaire-50 hover:text-icaire-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-icaire-400"
                          >
                            {r.name}
                          </Link>
                        ))}
                      </ResultGroup>
                    )}

                    {results.subdomains.length > 0 && (
                      <ResultGroup label="Subdomains" icon={Network}>
                        {results.subdomains.map((r) => (
                          <Link
                            key={r.name}
                            to={`/taxonomy/${r.topDomainId}#${r.slug}`}
                            className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-icaire-50 hover:text-icaire-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-icaire-400"
                          >
                            <span className="block">{r.name}</span>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">{r.topDomainName}</span>
                          </Link>
                        ))}
                      </ResultGroup>
                    )}

                    {results.papers.length > 0 && (
                      <ResultGroup label="Papers" icon={FileText}>
                        {results.papers.map((r) => (
                          <Link
                            key={r.id}
                            to={`/papers/${r.id}`}
                            className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-icaire-50 hover:text-icaire-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-icaire-400"
                          >
                            <span className="line-clamp-1 block">{r.title}</span>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">{r.authors}</span>
                          </Link>
                        ))}
                      </ResultGroup>
                    )}
                  </>
                )}
              </div>
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
        </div>

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
      </div>
    </div>
  );
}

function ResultGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Layers;
  children: ReactNode;
}) {
  return (
    <div className="mb-1 last:mb-0">
      <div className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        <Icon size={12} />
        {label}
      </div>
      {children}
    </div>
  );
}
