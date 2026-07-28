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

// One consistent ICAIRE-green identity across every domain — icons still
// differ per domain for scannability, but color no longer does (previously
// each of the 7 domains had its own hue; unified per design review so the
// Taxonomy Hub reads as one coherent system, not a multicolor dashboard).
const GREEN: Omit<DomainStyle, "icon"> = {
  gradient: "from-icaire-700 to-icaire-500",
  chip: "bg-icaire-500/10 text-icaire-700 dark:text-icaire-300",
  text: "text-icaire-700 dark:text-icaire-300",
};

const ICONS: Record<string, LucideIcon> = {
  TD1: Scale,
  TD2: Eye,
  TD3: ShieldCheck,
  TD4: Compass,
  TD5: Landmark,
  TD6: Globe,
  TD7: FileCheck,
};

export function getDomainStyle(id: string): DomainStyle {
  return { icon: ICONS[id] ?? Compass, ...GREEN };
}
