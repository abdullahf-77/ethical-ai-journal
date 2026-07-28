import { Link } from "react-router-dom";
import { ArrowRight, Layers, Network, FileStack } from "lucide-react";
import { Reveal } from "../Reveal";
import taxonomyData from "../../data/taxonomy.json";
import type { Taxonomy } from "../../types";
import { getDomainStyle } from "../../lib/domainStyle";

const taxonomy = taxonomyData as Taxonomy;
const totalSubdomains = taxonomy.top_domains.reduce((n, d) => n + d.subdomain_count, 0);
const totalPaperCount = taxonomy.top_domains.reduce((n, d) => n + d.paper_count, 0);

export function TaxonomyHubPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-icaire-50/50 p-8 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-icaire-950/30 sm:p-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(0,122,51,0.30), transparent)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(107,183,94,0.28), transparent)" }}
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
                The core of Ethical AI Journal
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                A living Taxonomy Hub for AI ethics
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
                Every paper in the journal is mapped against a single
                consolidated taxonomy — {taxonomy.top_domains.length} top-level domains built
                from twelve source frameworks, down to {totalSubdomains}+ granular
                subdomains. Browse the hierarchy, then jump straight to the
                research behind each concept.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {taxonomy.top_domains.slice(0, 7).map((td) => {
                  const style = getDomainStyle(td.id);
                  const Icon = style.icon;
                  return (
                    <span
                      key={td.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${style.chip}`}
                    >
                      <Icon size={13} />
                      {td.name}
                    </span>
                  );
                })}
              </div>

              <Link
                to="/taxonomy"
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-icaire-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-icaire-600/20 transition-all hover:bg-icaire-700 hover:shadow-xl active:scale-[0.98] dark:bg-icaire-500 dark:hover:bg-icaire-400"
              >
                Explore Taxonomy
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={Layers} label="Top-level domains" value={taxonomy.top_domains.length} />
              <StatCard icon={Network} label="Subdomains mapped" value={`${totalSubdomains}+`} />
              <StatCard icon={FileStack} label="Papers indexed" value={totalPaperCount} className="col-span-2" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: typeof Layers;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white/70 p-5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 ${className}`}
    >
      <Icon size={18} className="text-icaire-600 dark:text-icaire-400" />
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
