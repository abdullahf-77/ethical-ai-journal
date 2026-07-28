import { FileText, Users, Beaker } from "lucide-react";
import { Reveal } from "../Reveal";

const placeholderSubmissions = [
  {
    icon: FileText,
    status: "Open call",
    title: "Special Issue: Algorithmic Accountability",
    description:
      "Submit original research examining audit frameworks, redress mechanisms, and legal liability for automated decision systems.",
    deadline: "Closes Sep 30, 2026",
  },
  {
    icon: Users,
    status: "Rolling review",
    title: "Community Case Studies",
    description:
      "Short-form case studies documenting real-world AI governance challenges from practitioners, regulators, and civil society.",
    deadline: "Reviewed monthly",
  },
  {
    icon: Beaker,
    status: "Open call",
    title: "Reproducibility & Evaluation Track",
    description:
      "Papers proposing or validating benchmarks for safety, fairness, or robustness evaluation across model families.",
    deadline: "Closes Nov 15, 2026",
  },
];

export function SubmissionSection() {
  return (
    <section id="submissions" className="scroll-mt-24 bg-zinc-50/70 py-20 dark:bg-zinc-900/20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
              Get involved
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              New Submissions
            </h2>
          </div>
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Placeholder submission tracks — no submission workflow is wired up
            in this prototype.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderSubmissions.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:shadow-black/20">
                <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-icaire-700 to-icaire-400 text-white shadow-md shadow-icaire-600/20">
                  <item.icon size={20} />
                </div>
                <span className="mb-3 w-fit rounded-full bg-icaire-500/10 px-2.5 py-1 text-xs font-medium text-icaire-700 dark:text-icaire-300">
                  {item.status}
                </span>
                <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{item.deadline}</span>
                  <button
                    type="button"
                    className="rounded-full bg-icaire-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-[1.04] hover:bg-icaire-700 active:scale-[0.97] dark:bg-icaire-500 dark:hover:bg-icaire-400"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
