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
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-icaire-600 via-icaire-700 to-icaire-800 p-8 shadow-xl shadow-icaire-900/15 sm:p-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-70 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(107,183,94,0.45), transparent)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(234,247,240,0.25), transparent)" }}
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-icaire-200">
                The core of Ethical AI Journal
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                A living Taxonomy Hub for AI ethics
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-icaire-100/80">
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
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
                    >
                      <Icon size={13} />
                      {td.name}
                    </span>
                  );
                })}
              </div>

              <Link
                to="/taxonomy"
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-icaire-800 shadow-lg shadow-black/10 transition-all hover:bg-icaire-50 hover:shadow-xl active:scale-[0.98]"
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
      className={`rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm ${className}`}
    >
      <Icon size={18} className="text-icaire-200" />
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="text-xs text-icaire-100/70">{label}</p>
    </div>
  );
}
