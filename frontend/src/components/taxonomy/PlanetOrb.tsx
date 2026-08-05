// The orb used for every domain planet — a verbatim copy of the Hero's
// artwork, with no adaptations at all: the same .hero-glow / .hero-veil
// utilities (index.css) behind the same OrbitMotif geometry, colors, dot
// radii, stroke widths, viewBox, and animate-spin-slow rotation.
//
// Because nothing here is rescaled, the orb is a true proportional
// reduction of the Hero's: at a small planet size the 1px stroke and the
// dot radii shrink with everything else and render very faintly. Raising
// the planet size is what makes it read more like the Hero's version.

const dots = [
  { angle: -35, r: 1.6 },
  { angle: 10, r: 2.2 },
  { angle: 68, r: 1.4 },
  { angle: 132, r: 1.8 },
  { angle: 195, r: 1.4 },
  { angle: 250, r: 2 },
  { angle: 300, r: 1.6 },
];

export function PlanetOrb() {
  return (
    <span className="pointer-events-none absolute inset-0 block">
      <span className="hero-glow absolute inset-[-14%] block rounded-full opacity-70 blur-lg" />
      <span className="hero-veil absolute inset-0 block" />
      <span className="absolute inset-0 block animate-spin-slow">
        <svg
          viewBox="0 0 600 600"
          className="h-full w-full text-icaire-700/[0.14] dark:text-icaire-400/[0.28]"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="300" cy="300" r="260" fill="none" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="300" cy="300" rx="260" ry="120" fill="none" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="300" cy="300" rx="120" ry="260" fill="none" stroke="currentColor" strokeWidth="1" />
          {dots.map((d, i) => {
            const rad = (d.angle * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={300 + 260 * Math.cos(rad)}
                cy={300 + 260 * Math.sin(rad)}
                r={d.r * 2.2}
                fill="currentColor"
              />
            );
          })}
        </svg>
      </span>
    </span>
  );
}
