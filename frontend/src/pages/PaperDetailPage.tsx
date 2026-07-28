import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileQuestionMark,
  Sparkles,
  Users,
} from "lucide-react";
import papersData from "../data/papers.json";
import type { Paper } from "../types";
import { findDomainById, findSubdomainLocation } from "../lib/findDomain";
import { getDomainStyle } from "../lib/domainStyle";
import { sourceLabel, sourceStyle } from "../lib/sourceStyle";
import { getRelatedPapers } from "../lib/relatedPapers";
import { PaperCard } from "../components/papers/PaperCard";
import { Reveal } from "../components/Reveal";

const papers = papersData as Paper[];

export function PaperDetailPage() {
  const { id = "" } = useParams();
  const paper = papers.find((p) => p.id === id);

  if (!paper) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-32 text-center">
        <FileQuestionMark size={32} className="text-zinc-400" />
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Paper not found</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          We couldn&rsquo;t find a paper matching &ldquo;{id}&rdquo;.
        </p>
        <Link
          to="/taxonomy"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-icaire-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-icaire-700 dark:bg-icaire-500 dark:hover:bg-icaire-400"
        >
          <ArrowLeft size={15} /> Back to Taxonomy
        </Link>
      </div>
    );
  }

  const primaryDomain = paper.domains[0] ? findDomainById(paper.domains[0]) : null;
  const related = getRelatedPapers(paper, papers, 4);
  const confidencePct = Math.round(paper.confidence * 100);

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-3xl px-6 pb-10 pt-10 sm:px-8 sm:pt-14">
        <Reveal>
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <Link to="/" className="hover:text-icaire-700 dark:hover:text-icaire-400">Home</Link>
            <ChevronRight size={14} />
            <Link to="/taxonomy" className="hover:text-icaire-700 dark:hover:text-icaire-400">Taxonomy Hub</Link>
            {primaryDomain && (
              <>
                <ChevronRight size={14} />
                <Link
                  to={`/taxonomy/${primaryDomain.id}`}
                  className="hover:text-icaire-700 dark:hover:text-icaire-400"
                >
                  {primaryDomain.name}
                </Link>
              </>
            )}
            <ChevronRight size={14} />
            <span className="line-clamp-1 text-zinc-400 dark:text-zinc-500">{paper.title}</span>
          </nav>

          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sourceStyle(paper.source)}`}>
            {sourceLabel(paper.source)}
          </span>

          <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {paper.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <Users size={15} /> {paper.authors}
            </span>
            {paper.year && (
              <span className="inline-flex items-center gap-2">
                <Calendar size={15} /> {paper.year}
              </span>
            )}
          </div>

          {paper.link && (
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-icaire-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-icaire-700 active:scale-[0.98] dark:bg-icaire-500 dark:hover:bg-icaire-400"
            >
              Read Paper
              <ArrowUpRight size={15} />
            </a>
          )}
        </Reveal>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 sm:px-8">
        {paper.abstract && (
          <Reveal delay={0.05}>
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
                Abstract
              </h2>
              <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                {paper.abstract}
              </p>
            </section>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <section className="grid gap-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 dark:border-zinc-800 dark:bg-zinc-900/30 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Assigned Domains
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {paper.domains.map((id) => {
                  const d = findDomainById(id);
                  if (!d) return null;
                  const style = getDomainStyle(d.id);
                  const Icon = style.icon;
                  return (
                    <Link
                      key={id}
                      to={`/taxonomy/${id}`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-transform hover:scale-[1.03] ${style.chip}`}
                    >
                      <Icon size={13} />
                      {d.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Assigned Subdomains
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {paper.subdomains.map((name) => {
                  const loc = findSubdomainLocation(name);
                  const content = (
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-icaire-300 hover:text-icaire-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-icaire-700 dark:hover:text-icaire-400">
                      {name}
                    </span>
                  );
                  return loc ? (
                    <Link key={name} to={`/taxonomy/${loc.topDomainId}#${loc.slug}`}>
                      {content}
                    </Link>
                  ) : (
                    <span key={name}>{content}</span>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>

        {(paper.rationale || paper.confidence > 0) && (
          <Reveal delay={0.15}>
            <section className="rounded-2xl border border-icaire-600/20 bg-icaire-50/40 p-6 dark:border-icaire-400/20 dark:bg-icaire-950/20">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-icaire-700 dark:text-icaire-400">
                <Sparkles size={15} />
                AI Classification
              </h2>

              {paper.confidence > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Confidence score</span>
                    <span>{confidencePct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-icaire-700 to-icaire-400"
                      style={{ width: `${confidencePct}%` }}
                    />
                  </div>
                </div>
              )}

              {paper.rationale && (
                <p className="mt-4 border-l-2 border-icaire-600/30 pl-4 text-sm italic leading-relaxed text-zinc-600 dark:border-icaire-400/30 dark:text-zinc-300">
                  &ldquo;{paper.rationale}&rdquo;
                </p>
              )}
            </section>
          </Reveal>
        )}

        {related.length > 0 && (
          <Reveal delay={0.2}>
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
                Related Papers
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {related.map((p) => (
                  <PaperCard key={p.id} paper={p} compact />
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </div>
    </div>
  );
}
