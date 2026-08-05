// The orb used for every domain planet, taken directly from the Hero's
// artwork: the same .hero-glow / .hero-veil utilities (defined in index.css)
// behind the same OrbitMotif geometry — one circle, two perpendicular
// ellipses, and seven dots at the Hero's angles, all on the same 600x600
// viewBox and rotating on the same animate-spin-slow.
//
// Colors are the Hero's, unchanged: the same icaire-700/14% light and
// icaire-400/28% dark line color, and the same glow/veil gradients.
//
// The only deviations are forced by scale. The Hero renders this at 560px;
// a planet renders it near 104px, where the Hero's 1px stroke would compute
// to about 0.17px and its dot radii to well under a pixel — both would
// disappear. So strokes are pinned with non-scaling-stroke and the dot
// radii are multiplied up.

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
      <span className="hero-glow absolute inset-[-14%] block rounded-full opacity-80 blur-lg" />
      <span className="hero-veil absolute inset-0 block" />
      <span className="absolute inset-0 block animate-spin-slow">
        <svg
          viewBox="0 0 600 600"
          className="h-full w-full text-icaire-700/[0.14] dark:text-icaire-400/[0.28]"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx="300"
            cy="300"
            r="260"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="300"
            cy="300"
            rx="260"
            ry="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="300"
            cy="300"
            rx="120"
            ry="260"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {dots.map((d, i) => {
            const rad = (d.angle * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={300 + 260 * Math.cos(rad)}
                cy={300 + 260 * Math.sin(rad)}
                r={d.r * 5.5}
                fill="currentColor"
              />
            );
          })}
        </svg>
      </span>
    </span>
  );
}
