import {
  Scale,
  Eye,
  ShieldCheck,
  Compass,
  Landmark,
  Globe,
  FileCheck,
  type LucideIcon,
} from "lucide-react";

export interface DomainStyle {
  icon: LucideIcon;
  gradient: string; // tailwind gradient classes for icon badge
  chip: string; // text/bg for small badges
  text: string; // standalone text color (light + dark)
}

const STYLES: Record<string, DomainStyle> = {
  TD1: {
    icon: Scale,
    gradient: "from-rose-500 to-orange-400",
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
    text: "text-rose-600 dark:text-rose-300",
  },
  TD2: {
    icon: Eye,
    gradient: "from-indigo-500 to-sky-400",
    chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    text: "text-indigo-600 dark:text-indigo-300",
  },
  TD3: {
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-teal-400",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  TD4: {
    icon: Compass,
    gradient: "from-amber-500 to-yellow-400",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-300",
  },
  TD5: {
    icon: Landmark,
    gradient: "from-violet-500 to-purple-400",
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    text: "text-violet-600 dark:text-violet-300",
  },
  TD6: {
    icon: Globe,
    gradient: "from-cyan-500 to-blue-400",
    chip: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
    text: "text-cyan-600 dark:text-cyan-300",
  },
  TD7: {
    icon: FileCheck,
    gradient: "from-fuchsia-500 to-pink-400",
    chip: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300",
    text: "text-fuchsia-600 dark:text-fuchsia-300",
  },
};

const FALLBACK: DomainStyle = {
  icon: Compass,
  gradient: "from-zinc-500 to-zinc-400",
  chip: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
  text: "text-zinc-600 dark:text-zinc-300",
};

export function getDomainStyle(id: string): DomainStyle {
  return STYLES[id] ?? FALLBACK;
}
