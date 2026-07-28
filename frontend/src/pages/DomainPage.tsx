import { Link, useParams } from "react-router-dom";
import { ChevronRight, ArrowLeft, FileQuestionMark } from "lucide-react";
import papersData from "../data/papers.json";
import type { Paper } from "../types";
import { findDomainById } from "../lib/findDomain";
import { getDomainStyle } from "../lib/domainStyle";
import { SubdomainBlock } from "../components/taxonomy/SubdomainBlock";
import { Reveal } from "../components/Reveal";

const papers = papersData as Paper[];

export function DomainPage() {
  const { domainId = "" } = useParams();
  const domain = findDomainById(domainId);

  if (!domain) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-32 text-center">
        <FileQuestionMark size={32} className="text-zinc-400" />
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Domain not found</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          We couldn&rsquo;t find a domain matching &ldquo;{domainId}&rdquo;.
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

  const style = getDomainStyle(domain.id);
  const Icon = style.icon;

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-10 sm:px-8 sm:pt-14">
        <Reveal>
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <Link to="/" className="hover:text-icaire-700 dark:hover:text-icaire-400">Home</Link>
            <ChevronRight size={14} />
            <Link to="/taxonomy" className="hover:text-icaire-700 dark:hover:text-icaire-400">Taxonomy Hub</Link>
            <ChevronRight size={14} />
            <span className={style.text}>{domain.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${style.gradient}`}>
              <Icon size={22} />
            </div>
            <div>
              <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide ${style.chip}`}>
                {domain.id}
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                {domain.name}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
                {domain.definition}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span>{domain.domain_count} sub-domain groups</span>
                <span>&middot;</span>
                <span>{domain.subdomain_count} subdomains</span>
                <span>&middot;</span>
                <span>{domain.paper_count} papers indexed</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-6 sm:px-8">
        {domain.domains.map((mid) => (
          <section key={mid.name}>
            <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {mid.name}
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {mid.subdomains.length}
              </span>
            </h2>
            <div className="space-y-8">
              {mid.subdomains.map((sub) => (
                <SubdomainBlock key={sub.name} subdomain={sub} papers={papers} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
