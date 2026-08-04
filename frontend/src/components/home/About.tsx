import { Newspaper, Network, Users } from "lucide-react";
import { Reveal } from "../Reveal";

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
    title: "Open submissions",
    text: "Researchers and practitioners can contribute case studies, special issues, and reproducibility work.",
  },
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20 sm:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
          About the journal
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          A UNESCO-affiliated space for AI ethics
        </h2>
        <p className="mt-5 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
          Ethical AI Journal is a UNESCO Centre &middot; ICAIRE initiative that
          curates research, policy news, and community perspectives on the
          ethical, legal, and societal dimensions of artificial intelligence.
          Rather than scattering that work across disconnected sources,
          everything here is anchored to one living taxonomy — so a paper, a
          policy update, and an open call for submissions all map back to the
          same shared vocabulary of AI ethics.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-10 sm:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08} className="text-center sm:text-left">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-icaire-500/10 text-icaire-700 dark:text-icaire-400 sm:mx-0">
              <p.icon size={20} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {p.text}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
