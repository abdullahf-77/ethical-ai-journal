import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, X } from "lucide-react";
import type { PrinciplePaper } from "../../data/principlePapers";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Only the first few rows stagger — with a few hundred papers in the list,
 * staggering all of them would take many seconds and read as a slow cascade
 * rather than a quick settle. Everything past this index animates together. */
const STAGGER_CAP = 8;
const STAGGER_MS = 22;
/** Rows past this index skip the entry animation entirely — they're below the
 * fold on any realistic panel height, and animating hundreds at once is what
 * made a large principle lock the tab up on mount. */
const ANIMATED_ROWS = 14;

type TagKind = "mit" | "oecd";

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/** A compact tag chip: a small taxonomy prefix (MIT / OECD) plus the tag
 * itself, truncated with an ellipsis when it's too long for the row's tag
 * column. The truncation is purely visual — the underlying string is never
 * altered — and hover/focus reveals a tooltip carrying the taxonomy's full
 * name and the complete, verbatim tag text.
 *
 * The chip takes a 50%-minus-half-the-gap flex basis so exactly two sit per
 * line at any panel width. A fixed px cap can't do that: the tag column is a
 * percentage of a panel that changes width across breakpoints, so at some
 * widths two capped chips overflowed the line and dropped to one per line,
 * which made rows tall and ragged.
 *
 * The tooltip is anchored to the chip's RIGHT edge because these chips sit on
 * the right-hand side of the row — growing leftward keeps it inside the panel
 * instead of running off the viewport. */
function TagChip({ tag, kind }: { tag: string; kind: TagKind }) {
  const taxonomy = kind === "mit" ? "MIT AI Risk Repository" : "OECD AI Principles";
  return (
    <span
      // The tooltip is a CSS pseudo-element fed by data-tip (see .paper-chip in
      // index.css) rather than React state — deliberately, this component is
      // instantiated ~1100 times for a large principle. `title` is omitted so
      // the native tooltip doesn't double up on the styled one.
      className="paper-chip relative flex min-w-0 basis-[calc(50%-0.125rem)]"
      data-tip={`${taxonomy} — ${tag}`}
    >
      <span
        tabIndex={0}
        className={`inline-flex w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-4 outline-none focus-visible:ring-2 focus-visible:ring-icaire-500 ${
          kind === "mit"
            ? "border-icaire-200/80 bg-icaire-50/70 text-icaire-700 dark:border-icaire-800/80 dark:bg-icaire-950/30 dark:text-icaire-400"
            : "border-zinc-200/80 bg-zinc-50/70 text-zinc-500 dark:border-zinc-700/80 dark:bg-zinc-800/50 dark:text-zinc-400"
        }`}
      >
        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide opacity-55">
          {kind === "mit" ? "MIT" : "OECD"}
        </span>
        <span className="min-w-0 truncate">{tag}</span>
      </span>
    </span>
  );
}

/** A removable filter chip shown in the active-filters row. Unlike TagChip
 * this one isn't truncated — there are at most a handful active at once, so
 * showing the full text is clearer about what's actually applied. */
function RemovableChip({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex max-w-[240px] items-center gap-1 rounded-full border border-icaire-200 bg-icaire-50 px-2 py-0.5 text-[11px] text-icaire-700 transition-colors hover:border-icaire-300 dark:border-icaire-800 dark:bg-icaire-950/40 dark:text-icaire-400 dark:hover:border-icaire-700"
    >
      <span className="truncate">{tag}</span>
      <X size={10} className="shrink-0" />
    </button>
  );
}

/** A multi-select dropdown of tag checkboxes. Options are whatever tags are
 * actually present in the current (principle-filtered) paper set — never
 * hardcoded — so switching planets always offers exactly the filters that
 * apply. Hidden entirely when there's nothing to filter by.
 *
 * Labels WRAP rather than truncate: several OECD principle titles run well
 * past a line, and a filter you can't fully read is not a usable filter. The
 * options list carries its own max-height and scrolls internally so a long
 * list can't push the popover past the bottom of the screen. `align` pins the
 * popover to whichever button edge keeps it inside the panel. */
function TagFilterDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
  align = "left",
  reducedMotion,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (tag: string) => void;
  onClear: () => void;
  align?: "left" | "right";
  reducedMotion?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (options.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
          selected.size > 0
            ? "border-icaire-300 bg-icaire-50 text-icaire-700 dark:border-icaire-700 dark:bg-icaire-950/40 dark:text-icaire-400"
            : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
        }`}
      >
        {/* Deliberately no "(n)" count in the label: appending it widened the
            button, and because these sit in a right-aligned group that pushed
            BOTH filter buttons sideways the moment a filter was ticked — the
            control moved out from under the cursor mid-interaction. The active
            state is already unmistakable from the button's filled green
            treatment plus the removable chips row below. */}
        {label}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.16, ease: EASE }}
            className={`absolute top-full z-40 mt-1.5 w-[320px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <div role="listbox" aria-multiselectable="true" className="max-h-[280px] overflow-y-auto p-1.5 scrollbar-thin">
              {options.map((opt) => {
                const checked = selected.has(opt);
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      checked
                        ? "bg-icaire-50/70 dark:bg-icaire-950/30"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(opt)}
                      className="mt-[3px] size-3.5 shrink-0 accent-icaire-600"
                    />
                    <span
                      className={`min-w-0 leading-relaxed ${
                        checked
                          ? "font-medium text-icaire-800 dark:text-icaire-300"
                          : "text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
            {selected.size > 0 && (
              <div className="border-t border-zinc-100 p-1.5 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClear}
                  className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-icaire-600 transition-colors hover:bg-icaire-50 dark:text-icaire-400 dark:hover:bg-icaire-950/40"
                >
                  Clear {label}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** One paper = one horizontal row, laid out as a GRID rather than flex.
 *
 * Flex was the original bug: the tag group was `shrink-0` while the title was
 * shrinkable, so flex resolved the overflow entirely at the title's expense
 * and collapsed it to roughly one word per line while the chips still ran off
 * the right edge. A grid fixes it structurally — the track sizes are declared
 * up front, so the title column keeps its share no matter how many chips a
 * paper carries, and `minmax(0, ...)` on both content columns lets them
 * actually shrink to their track instead of being floored at max-content.
 *
 * Below `sm` the tag column is dropped and the chips move under the title
 * (still indented past the number) — at that width a 3-column split leaves
 * neither column readable. */
function PaperRow({ paper, index, animate }: { paper: PrinciplePaper; index: number; animate: boolean }) {
  const hasTags = paper.mitTags.length > 0 || paper.oecdTags.length > 0;
  return (
    <li
      className={`paper-row border-b border-zinc-100 last:border-0 dark:border-zinc-800/70 ${animate ? "paper-row-in" : ""}`}
      style={animate ? { animationDelay: `${Math.min(index, STAGGER_CAP) * STAGGER_MS}ms` } : undefined}
    >
      <a
        href={paper.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group grid grid-cols-[1.4rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1.5 rounded-md py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-icaire-500 sm:grid-cols-[1.4rem_minmax(0,1fr)_minmax(0,42%)]"
      >
        <span className="pt-px font-mono text-[11px] leading-5 tabular-nums text-zinc-300 transition-colors group-hover:text-icaire-500 dark:text-zinc-600 dark:group-hover:text-icaire-500">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 font-serif text-sm leading-snug text-zinc-800 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-icaire-700 motion-reduce:group-hover:translate-x-0 dark:text-zinc-100 dark:group-hover:text-icaire-400">
          {paper.title}
          <ExternalLink
            size={11}
            className="ml-1 inline-block shrink-0 -translate-y-px opacity-0 transition-opacity duration-200 group-hover:opacity-70"
          />
        </span>
        {hasTags && (
          <span className="col-start-2 flex min-w-0 flex-wrap content-start gap-1 sm:col-start-3 sm:justify-end">
            {paper.mitTags.map((t) => (
              <TagChip key={`mit-${t}`} tag={t} kind="mit" />
            ))}
            {paper.oecdTags.map((t) => (
              <TagChip key={`oecd-${t}`} tag={t} kind="oecd" />
            ))}
          </span>
        )}
      </a>
    </li>
  );
}

/** The reusable "Related Research" content: header + counts, MIT/OECD filters,
 * active-filter chips, and the full numbered paper list.
 *
 * No outer positioning/border/backdrop here — PrinciplePapersPanel wraps this
 * in the floating desktop card and the mobile accordion renders it inline, so
 * both stay in lockstep instead of maintaining two implementations of the same
 * filtering logic.
 *
 * The header and filter bar sit OUTSIDE the animated region on purpose: when
 * the principle or a filter changes, only the rows transition, so the controls
 * never flash or jump under the cursor mid-click. */
export function PapersExplorer({
  papers,
  scrollable = false,
  reducedMotion,
  className,
}: {
  papers: PrinciplePaper[];
  /** Desktop panel scrolls internally within a fixed height; mobile's
   * accordion should just flow with the page instead. */
  scrollable?: boolean;
  reducedMotion?: boolean;
  className?: string;
}) {
  const [mitFilter, setMitFilter] = useState<Set<string>>(() => new Set());
  const [oecdFilter, setOecdFilter] = useState<Set<string>>(() => new Set());
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Changing the selected UNESCO principle swaps in a whole new `papers`
  // array — reset filters so stale selections from the previous planet don't
  // silently carry over (and can't produce an impossible "N of M" against the
  // new set), and return the list to the top so the new principle starts from
  // its first paper rather than mid-scroll.
  useEffect(() => {
    setMitFilter(new Set());
    setOecdFilter(new Set());
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [papers]);

  const mitOptions = useMemo(() => uniqueSorted(papers.flatMap((p) => p.mitTags)), [papers]);
  const oecdOptions = useMemo(() => uniqueSorted(papers.flatMap((p) => p.oecdTags)), [papers]);

  const filtered = useMemo(
    () =>
      papers.filter(
        (p) =>
          (mitFilter.size === 0 || p.mitTags.some((t) => mitFilter.has(t))) &&
          (oecdFilter.size === 0 || p.oecdTags.some((t) => oecdFilter.has(t))),
      ),
    [papers, mitFilter, oecdFilter],
  );

  const hasActiveFilters = mitFilter.size > 0 || oecdFilter.size > 0;

  // Identifies "which set of rows is on screen". Changing it swaps the list
  // through AnimatePresence, which is what produces the fade-out/fade-in.
  const listKey = useMemo(
    () => `${papers.length}|${[...mitFilter].sort().join("~")}|${[...oecdFilter].sort().join("~")}`,
    [papers, mitFilter, oecdFilter],
  );

  const toggleMit = (tag: string) => {
    setMitFilter((s) => toggleInSet(s, tag));
    scrollerRef.current?.scrollTo({ top: 0 });
  };
  const toggleOecd = (tag: string) => {
    setOecdFilter((s) => toggleInSet(s, tag));
    scrollerRef.current?.scrollTo({ top: 0 });
  };
  const clearAll = () => {
    setMitFilter(new Set());
    setOecdFilter(new Set());
    scrollerRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className={`flex ${scrollable ? "h-full flex-col" : "flex-col"} ${className ?? ""}`}>
      <div className="flex flex-none flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-zinc-100 px-5 pb-3 pt-4 dark:border-zinc-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Related Research
          </p>
          <p className="mt-0.5 font-serif text-sm text-zinc-700 tabular-nums dark:text-zinc-200">
            {papers.length === 0
              ? "No papers yet"
              : hasActiveFilters
                ? `${filtered.length} of ${papers.length} papers`
                : `${papers.length} paper${papers.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {papers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <TagFilterDropdown
              label="MIT Tags"
              options={mitOptions}
              selected={mitFilter}
              onToggle={toggleMit}
              onClear={() => {
                setMitFilter(new Set());
                scrollerRef.current?.scrollTo({ top: 0 });
              }}
              reducedMotion={reducedMotion}
            />
            <TagFilterDropdown
              label="OECD Tags"
              options={oecdOptions}
              selected={oecdFilter}
              onToggle={toggleOecd}
              onClear={() => {
                setOecdFilter(new Set());
                scrollerRef.current?.scrollTo({ top: 0 });
              }}
              align="right"
              reducedMotion={reducedMotion}
            />
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-none flex-wrap items-center gap-1.5 border-b border-zinc-100 px-5 py-2 dark:border-zinc-800">
          {[...mitFilter].map((t) => (
            <RemovableChip key={`mit-${t}`} tag={t} onRemove={() => toggleMit(t)} />
          ))}
          {[...oecdFilter].map((t) => (
            <RemovableChip key={`oecd-${t}`} tag={t} onRemove={() => toggleOecd(t)} />
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto shrink-0 text-[11px] font-medium text-zinc-400 underline-offset-2 transition-colors hover:text-icaire-600 hover:underline dark:text-zinc-500 dark:hover:text-icaire-400"
          >
            Clear filters
          </button>
        </div>
      )}

      <div
        ref={scrollerRef}
        className={scrollable ? "min-h-0 flex-1 overflow-y-auto px-5 scrollbar-thin" : "px-5"}
      >
        {/* mode="wait" so the outgoing rows finish fading before the incoming
            set mounts — cross-fading hundreds of absolutely-stacked rows would
            be both visually muddy and expensive. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={listKey}
            variants={{
              initial: reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 },
              animate: {
                opacity: 1,
                y: 0,
                transition: { duration: reducedMotion ? 0.1 : 0.24, ease: EASE },
              },
              exit: reducedMotion
                ? { opacity: 0, transition: { duration: 0.08 } }
                : { opacity: 0, y: -4, transition: { duration: 0.14 } },
            }}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
                {papers.length === 0
                  ? "No papers indexed under this principle yet."
                  : "No papers match the current filters."}
              </p>
            ) : (
              <ul className="pb-2">
                {/* Only the rows that are actually on screen at swap time run
                    the entry animation. Animating all 200+ at once pinned the
                    compositor long enough to lock up the tab; the rest simply
                    arrive with the container's own fade, which is
                    indistinguishable since they're below the fold anyway. */}
                {filtered.map((paper, i) => (
                  <PaperRow
                    key={paper.link}
                    paper={paper}
                    index={i}
                    animate={!reducedMotion && i < ANIMATED_ROWS}
                  />
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * The papers view's left-hand panel — a modern, editorial "Related Research"
 * list: numbered rows, subtle MIT/OECD tag chips, and dynamic filters, all
 * reusing the site's neutral/green palette and typography.
 *
 * Deliberately NOT `overflow-hidden`: the filter popovers are absolutely
 * positioned children of the header, and clipping them to this box is what cut
 * the option labels off mid-word. The scrolling list below owns its own
 * overflow, so nothing else needs clipping here.
 */
export function PrinciplePapersPanel({
  papers,
  maxHeight,
  reducedMotion,
}: {
  papers: PrinciplePaper[];
  maxHeight: number;
  reducedMotion?: boolean;
}) {
  return (
    <motion.div
      // No `exit` — this panel is mounted/unmounted directly rather than
      // through AnimatePresence (see TaxonomyUniverse for why).
      initial={reducedMotion ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: EASE }}
      // Width is a balance: wide enough that a paper title never collapses
      // into a one-word-per-line column, but stopping short of the focused
      // planet's top-right anchor so the planet stays the dominant element.
      // No backdrop-blur here: a blur filter has to re-sample everything
      // behind the panel on every frame, and with a couple of hundred rows
      // scrolling and animating above it that repaint cost was enough to lock
      // the tab. A near-opaque background reads almost identically over this
      // page's very light backdrop and costs nothing.
      className="absolute inset-y-0 left-0 z-[105] flex w-[56%] min-w-[320px] max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white/[0.97] shadow-sm dark:border-zinc-700 dark:bg-zinc-900/[0.97]"
      style={{ maxHeight }}
    >
      <PapersExplorer papers={papers} scrollable reducedMotion={reducedMotion} />
    </motion.div>
  );
}
