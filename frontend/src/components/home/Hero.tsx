import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText } from "lucide-react";
import taxonomyData from "../../data/taxonomy.json";
import type { Taxonomy } from "../../types";

const taxonomy = taxonomyData as Taxonomy;
const totalSubdomains = taxonomy.top_domains.reduce((n, d) => n + d.subdomain_count, 0);

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 text-zinc-400 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_40%,transparent_100%)] dark:text-zinc-600" />
      <div
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl dark:opacity-30"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,122,51,0.30), rgba(107,183,94,0.15), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300"
        >
          <span className="flex size-1.5 rounded-full bg-icaire-500" />
          A UNESCO Centre &middot; ICAIRE initiative
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl"
        >
          Mapping the ethics of
          <span className="block font-serif italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-icaire-700 via-icaire-600 to-icaire-400">
            artificial intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-zinc-500 dark:text-zinc-400"
        >
          Ethical AI Journal curates research, news, and open submissions
          around a single living taxonomy — {taxonomy.top_domains.length} domains and{" "}
          {totalSubdomains}+ subdomains charting the risks, rights, and
          responsibilities of AI systems.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
