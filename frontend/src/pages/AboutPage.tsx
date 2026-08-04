import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, Network, Users } from "lucide-react";
import { Reveal } from "../components/Reveal";

const pillars = [
  {
    icon: Newspaper,
    title: "Research & News",
    text: "Curated updates on policy, governance, and emerging scholarship, refreshed as the field moves.",
  },
  {
    icon: Network,
    title: "A living taxonomy",
    text: "Every concept and paper is mapped to a shared hierarchy of domains, so you can browse by idea, not just by date.",
  },
  {
    icon: Users,
    title: "Curated, not crowdsourced",
    text: "The journal indexes and organizes existing published research; it does not run an open call for papers.",
  },
];

export function AboutPage() {
  return (
    <div className="pb-24">
      <div className="mx-auto max-w-3xl px-6 pb-10 pt-14 text-center sm:px-8 sm:pt-20">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
            About the journal
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            A UNESCO-affiliated space for AI ethics
          </h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            Ethical AI Journal is a UNESCO Centre &middot; ICAIRE initiative
            that curates research, policy news, and community perspectives on
            the ethical, legal, and societal dimensions of artificial
            intelligence. Rather than scattering that work across
            disconnected sources, everything here is anchored to one living
            taxonomy — so a paper and a policy update both map back to the
            same shared vocabulary of AI ethics.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-6 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="text-center sm:text-left">
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-icaire-500/10 text-icaire-700 dark:text-icaire-400 sm:mx-0">
                <p.icon size={20} />
              </div>
              <h2 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {p.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {p.text}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-zinc-200 bg-zinc-50/60 px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Ready to explore?
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Browse the taxonomy to find the research behind each concept.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-full bg-icaire-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-icaire-700 active:scale-[0.98] dark:bg-icaire-500 dark:hover:bg-icaire-400"
              >
                Back to home
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
