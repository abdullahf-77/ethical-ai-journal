import { ArrowRight, FilePenLine } from "lucide-react";
import { Reveal } from "../Reveal";

export function SubmissionSection() {
  return (
    <section id="submissions" className="scroll-mt-24 bg-zinc-50/70 py-20 dark:bg-zinc-900/20">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-icaire-600 dark:text-icaire-400">
            Get involved
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            New Submissions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Placeholder submission tracks — no submission workflow is wired up
            in this prototype.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <button
            type="button"
            className="group mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl border-2 border-icaire-600/30 bg-white px-8 py-10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-icaire-600 hover:shadow-xl hover:shadow-icaire-600/10 dark:border-icaire-400/20 dark:bg-zinc-900/60 dark:hover:border-icaire-400/70 dark:hover:shadow-black/20"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-icaire-700 to-icaire-400 text-white shadow-md shadow-icaire-600/20">
              <FilePenLine size={26} />
            </span>
            <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Journal Submission Portal
            </span>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-icaire-600 px-5 py-2 text-sm font-semibold text-white transition-transform group-hover:scale-[1.04] dark:bg-icaire-500">
              Explore
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}
