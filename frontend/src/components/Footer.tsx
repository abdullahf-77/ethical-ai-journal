import { Link } from "react-router-dom";
import { Globe, Rss, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}unesco-icaire-logo.png`}
                alt="UNESCO Centre / ICAIRE logo"
                className="h-10 w-auto"
              />
              <div className="leading-tight">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">Ethical AI Journal</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  International Center for AI Research &amp; Ethics
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              A UNESCO-affiliated initiative curating research, news, and a
              living taxonomy of the ethical, legal, and societal dimensions
              of artificial intelligence.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link to="/" className="hover:text-icaire-700 dark:hover:text-icaire-400">Home</Link></li>
              <li><a href="/#news" className="hover:text-icaire-700 dark:hover:text-icaire-400">Latest News</a></li>
              <li><a href="/#submissions" className="hover:text-icaire-700 dark:hover:text-icaire-400">Submissions</a></li>
              <li><Link to="/taxonomy" className="hover:text-icaire-700 dark:hover:text-icaire-400">Taxonomy Hub</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Connect</p>
            <div className="mt-4 flex gap-2">
              {[Globe, Rss, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Social link (placeholder)"
                  className="grid size-9 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-icaire-300 hover:bg-icaire-50 hover:text-icaire-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-icaire-700 dark:hover:bg-zinc-800 dark:hover:text-icaire-400"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center gap-4 border-t border-zinc-200 pt-6 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Ethical AI Journal &middot; UNESCO Centre &middot; ICAIRE. Prototype build — placeholder content.</p>
          <p className="uppercase tracking-wider">Frontend prototype only</p>
        </div>
      </div>
    </footer>
  );
}
