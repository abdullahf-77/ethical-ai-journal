import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { HeroArt } from "./HeroArt";

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
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 animate-spin-slow">
      <svg
        viewBox="0 0 600 600"
        className="h-full w-full text-icaire-700/[0.14] dark:text-icaire-400/[0.28]"
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
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-900">
      <div className="bg-grid pointer-events-none absolute inset-0 text-zinc-400 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_30%,transparent_100%)] dark:text-zinc-600" />
      <div
        className="hero-glow pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 opacity-70 blur-3xl"
        aria-hidden="true"
      />
      <div className="hero-veil pointer-events-none absolute inset-0" aria-hidden="true" />
      <HeroArt />
      <OrbitMotif />

      <div className="relative mx-auto flex min-h-[560px] max-w-4xl flex-col justify-center px-6 py-16 text-center lg:min-h-[680px] lg:py-0">
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
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:absolute lg:inset-x-6 lg:top-[calc(50%+258px)] lg:mt-0"
        >
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800/50"
          >
            <Info size={16} />
            About the Journal
          </Link>
          <Link
            to="/taxonomy"
            className="group inline-flex items-center gap-2 rounded-full bg-icaire-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-icaire-600/20 transition-all hover:bg-icaire-700 hover:shadow-xl hover:shadow-icaire-600/30 active:scale-[0.98] dark:bg-icaire-500 dark:hover:bg-icaire-400"
          >
            Explore the Taxonomy
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
