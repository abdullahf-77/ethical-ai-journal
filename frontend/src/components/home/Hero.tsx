import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, FilePenLine } from "lucide-react";

function OrbitMotif() {
  const dots = [
    { angle: -35, r: 1.6 },
    { angle: 10, r: 2.2 },
    { angle: 68, r: 1.4 },
    { angle: 132, r: 1.8 },
    { angle: 195, r: 1.4 },
    { angle: 250, r: 2 },
    { angle: 300, r: 1.6 },
  ];
  return (
    <svg
      viewBox="0 0 600 600"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 text-icaire-900/[0.07] dark:text-icaire-100/[0.06]"
      aria-hidden="true"
    >
      <circle cx="300" cy="300" r="260" fill="none" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="300" cy="300" rx="260" ry="120" fill="none" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="300" cy="300" rx="120" ry="260" fill="none" stroke="currentColor" strokeWidth="1" />
      {dots.map((d, i) => {
        const rad = (d.angle * Math.PI) / 180;
        const x = 300 + 260 * Math.cos(rad);
        const y = 300 + 260 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r={d.r * 2.2} fill="currentColor" />;
      })}
    </svg>
  );
}

export function Hero() {
  return (
    <section id="submissions" className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-900">
      <div className="bg-grid pointer-events-none absolute inset-0 text-zinc-400 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_30%,transparent_100%)] dark:text-zinc-600" />
      <OrbitMotif />

      <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-24 text-center sm:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          Welcome to the
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance mt-3 text-4xl font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-50 sm:text-5xl"
        >
          Ethical AI Journal
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-zinc-500 dark:text-zinc-400"
        >
          Explore research, news, and emerging perspectives on artificial
          intelligence ethics, governance, safety, fairness, privacy, and
          responsible innovation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex justify-center"
        >
          <button
            type="button"
            className="group inline-flex items-center gap-3 rounded-2xl border border-icaire-600/30 bg-white/80 px-5 py-3 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-icaire-600 hover:shadow-md dark:border-icaire-400/20 dark:bg-zinc-900/60 dark:hover:border-icaire-400/70"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-icaire-700 to-icaire-400 text-white">
              <FilePenLine size={15} />
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Journal Submission Portal
            </span>
            <ArrowRight size={15} className="text-icaire-600 transition-transform group-hover:translate-x-0.5 dark:text-icaire-400" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/taxonomy"
            className="group inline-flex items-center gap-2 rounded-full bg-icaire-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-icaire-600/20 transition-all hover:bg-icaire-700 hover:shadow-xl hover:shadow-icaire-600/30 active:scale-[0.98] dark:bg-icaire-500 dark:hover:bg-icaire-400"
          >
            Explore the Taxonomy
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#news"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800/50"
          >
            <BookOpenText size={16} />
            Read the latest
          </a>
        </motion.div>
      </div>
    </section>
  );
}
