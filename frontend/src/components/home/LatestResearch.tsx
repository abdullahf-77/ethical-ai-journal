import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../Reveal";
import papersData from "../../data/papers.json";
import type { Paper } from "../../types";

const papers = papersData as Paper[];

// The three newest papers in the index, skipping ones that repeat an earlier
// pick's primary subdomain so the row spans distinct corners of the taxonomy.
const latestPapers: Paper[] = [];
const seenSubdomains = new Set<string>();
for (const paper of [...papers].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))) {
  const primary = paper.subdomains[0] ?? paper.title;
  if (seenSubdomains.has(primary)) continue;
  seenSubdomains.add(primary);
  latestPapers.push(paper);
  if (latestPapers.length === 3) break;
}

function formatSource(source: string) {
  if (source === "arxiv") return "arXiv";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function LatestResearch() {
  return (
    <section id="research" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 sm:px-8">
      <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
            Recently indexed
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Latest Research
          </h2>
        </div>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          The newest papers added to the index, each mapped to its domain in
          the Taxonomy Hub.
        </p>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latestPapers.map((paper, i) => (
          <Reveal key={paper.id} delay={i * 0.08}>
            <article className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:shadow-black/20">
              <div className="mb-4 flex items-center gap-3 text-xs">
                <span className="rounded-full bg-icaire-500/10 px-2.5 py-1 font-medium text-icaire-700 dark:text-icaire-300">
                  {paper.subdomains[0]}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500">
                  {paper.year} &middot; {formatSource(paper.source)}
                </span>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                {paper.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {paper.authors}
              </p>
              <a
                href={paper.link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-icaire-600 dark:text-zinc-100 dark:group-hover:text-icaire-400"
              >
                Read paper
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
