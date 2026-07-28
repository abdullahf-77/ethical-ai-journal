import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../Reveal";

const placeholderNews = [
  {
    tag: "Policy",
    date: "Jul 14, 2026",
    title: "UNESCO convenes global panel on frontier-model governance",
    excerpt:
      "Representatives from 40+ member states met in Paris to align on shared evaluation standards for high-capability AI systems ahead of the 2027 review cycle.",
  },
  {
    tag: "Research",
    date: "Jul 08, 2026",
    title: "New study links dataset provenance gaps to downstream bias",
    excerpt:
      "A cross-institutional review of training-data pipelines finds that undocumented provenance is the strongest predictor of unexplained model disparities.",
  },
  {
    tag: "Community",
    date: "Jun 29, 2026",
    title: "ICAIRE opens applications for its 2026 research fellowship",
    excerpt:
      "The fellowship supports early-career researchers working at the intersection of AI safety, human rights, and applied ethics.",
  },
];

export function NewsSection() {
  return (
    <section id="news" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 sm:px-8">
      <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
            Latest updates
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            News &amp; Insights
          </h2>
        </div>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Placeholder articles for demonstration — this feed will connect to
          the journal&rsquo;s publishing backend.
        </p>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderNews.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08}>
            <article className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:shadow-black/20">
              <div className="mb-4 flex items-center gap-3 text-xs">
                <span className="rounded-full bg-icaire-500/10 px-2.5 py-1 font-medium text-icaire-700 dark:text-icaire-300">
                  {item.tag}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500">{item.date}</span>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.excerpt}
              </p>
              <button
                type="button"
                className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-icaire-600 dark:text-zinc-100 dark:group-hover:text-icaire-400"
              >
                Read More
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
