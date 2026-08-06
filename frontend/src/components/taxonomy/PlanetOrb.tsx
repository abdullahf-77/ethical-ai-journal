// The orb used for every domain planet: a shared boundary ring behind
// per-domain iconography (PlanetGeometry) that gives each of the ten
// principles its own visual identity, on the same .hero-glow / .hero-veil
// utilities (index.css) used by the Hero artwork. `emphasized` (hover or
// focus) brightens the glow and fades the geometry in fully; unemphasized
// orbs sit at a slightly lower opacity so a hovered/focused orb reads as
// the one currently "in front."
import { PlanetGeometry } from "./PlanetGeometry";

export function PlanetOrb({ domainId, emphasized = false }: { domainId: number; emphasized?: boolean }) {
  return (
    <span className="pointer-events-none absolute inset-0 block">
      <span
        className="hero-glow absolute inset-[-8%] block rounded-full blur-lg transition-opacity duration-300"
        style={{ opacity: emphasized ? 0.44 : 0.32 }}
      />
      <span className="hero-veil absolute inset-0 block" />
      <span
        className="absolute inset-0 block transition-opacity duration-300"
        style={{ opacity: emphasized ? 1 : 0.88 }}
      >
        <svg
          viewBox="0 0 600 600"
          data-orb="true"
          className="h-full w-full text-icaire-700/50 dark:text-icaire-400/50"
          aria-hidden="true"
          focusable="false"
        >
          <PlanetGeometry domainId={domainId} />
        </svg>
      </span>
    </span>
  );
}
