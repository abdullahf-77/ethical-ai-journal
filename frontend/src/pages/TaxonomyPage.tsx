import { Reveal } from "../components/Reveal";
import { TaxonomyUniverse } from "../components/taxonomy/TaxonomyUniverse";
import { TaxonomySpaceBackground } from "../components/taxonomy/TaxonomySpaceBackground";

// This page is intentionally frontend-only: it no longer reads from the
// Paper Sourcing Pipeline's output (../data/taxonomy.json, ../data/papers.json)
// or the old domain/subdomain/paper-count data those files carry. The 10
// domains rendered here live in ../data/ethicalAiDomains.ts. The pipeline
// itself is untouched — this page simply stops consuming it.

export function TaxonomyPage() {
  return (
    <div className="relative pb-10">
      {/* Decorative "knowledge universe" backdrop — sits behind everything
          below and never affects layout or interaction. */}
      <TaxonomySpaceBackground />

      <div className="relative z-10">
        <div className="mx-auto max-w-3xl px-6 pb-1 pt-8 text-center sm:px-8 sm:pt-10">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
              Taxonomy Hub
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              A living taxonomy for AI ethics
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Explore the core ethical principles that guide the responsible
              development, deployment, and governance of artificial
              intelligence. Select a principle to learn more.
            </p>
          </Reveal>
        </div>

        <div className="px-6 sm:px-8">
          <TaxonomyUniverse />
        </div>
      </div>
    </div>
  );
}
