import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "News", to: "/#news" },
  { label: "Submissions", to: "/#submissions" },
  { label: "Taxonomy Hub", to: "/taxonomy" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-[#0a0a0d]/80 backdrop-blur-lg border-b border-zinc-200/80 dark:border-zinc-800/80"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/unesco-icaire-logo.png"
            alt="UNESCO Centre / ICAIRE — International Center for AI Research & Ethics"
            className="h-9 w-auto"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Ethical AI Journal
            </span>
            <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              UNESCO &middot; ICAIRE
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-icaire-50 hover:text-icaire-700 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-icaire-400"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="grid size-9 place-items-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to="/taxonomy"
            className="hidden items-center gap-1.5 rounded-full bg-icaire-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-icaire-700 active:scale-[0.98] dark:bg-icaire-500 dark:hover:bg-icaire-400 sm:inline-flex"
          >
            <Sparkles size={14} /> Explore
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="grid size-9 place-items-center rounded-full border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300 md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-[#0a0a0d] md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.to}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
