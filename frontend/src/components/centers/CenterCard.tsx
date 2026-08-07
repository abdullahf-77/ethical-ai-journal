import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import type { Center } from "../../types";
import countryImages from "../../data/countryImages.json";

const EASE = [0.16, 1, 0.3, 1] as const;

type CountryImage = { url: string; title: string; credit: string; sourcePage: string; license: string };
const images = countryImages as Record<string, CountryImage>;

// Deterministic fallback gradient per country for the (currently small)
// set without a verified Wikimedia photo yet — same country always gets
// the same gradient rather than a random one on every render.
const FALLBACK_GRADIENTS = [
  "from-icaire-700 via-icaire-800 to-zinc-900",
  "from-emerald-700 via-teal-800 to-zinc-900",
  "from-amber-700 via-orange-800 to-zinc-900",
  "from-sky-700 via-indigo-800 to-zinc-900",
  "from-rose-700 via-fuchsia-800 to-zinc-900",
];

function fallbackGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FALLBACK_GRADIENTS[h % FALLBACK_GRADIENTS.length];
}

/** The center detail overlay: a Wikimedia landmark photo (with visible
 * attribution) or a deterministic gradient fallback, the center's name,
 * focus, affiliation, and website link. */
export function CenterCard({ center, onClose }: { center: Center; onClose: () => void }) {
  const image = images[center.country];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={center.name}
        className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
      >
        <div
          className={`relative h-48 w-full bg-cover bg-center ${image ? "" : `bg-gradient-to-br ${fallbackGradient(center.country)}`}`}
          style={image ? { backgroundImage: `url(${image.url})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <X size={16} />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">
              {center.city !== "National" ? `${center.city}, ` : ""}
              {center.country}
            </p>
            <h3 className="mt-1 text-lg font-semibold leading-tight text-white">{center.name}</h3>
          </div>
        </div>

        <div className="bg-white p-5 dark:bg-zinc-900">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{center.focus}</p>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{center.affiliation}</p>

          {center.website && (
            <a
              href={center.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-icaire-700 hover:text-icaire-800 dark:text-icaire-400 dark:hover:text-icaire-300"
            >
              Visit website
              <ExternalLink size={13} />
            </a>
          )}

          {image && (
            <p className="mt-4 border-t border-zinc-100 pt-3 text-[10px] leading-snug text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
              Photo: {image.title} — {image.credit}, {image.license}, via{" "}
              <a href={image.sourcePage} target="_blank" rel="noopener noreferrer" className="underline">
                Wikimedia Commons
              </a>
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
