/**
 * The pale sage-green translucent sphere used for every domain planet —
 * a scaled-down version of public/taxonomy-orb.svg, minus that file's
 * background, grid, and crossing orbit rings (the rings already exist at
 * the level of the whole system, so repeating them inside each 104px
 * planet would just be visual noise).
 *
 * Gradient ids are suffixed per instance because several of these render
 * on the same page and SVG defs share a document-wide id namespace.
 */
export function PlanetOrb({ uid }: { uid: string | number }) {
  const sphere = `orb-sphere-${uid}`;
  const glow = `orb-glow-${uid}`;
  const rim = `orb-rim-${uid}`;
  const blur = `orb-blur-${uid}`;

  return (
    // The sphere is very pale by design, so it's knocked back in dark mode
    // to keep it from glaring against the near-black page background.
    <svg
      viewBox="0 0 1240 1240"
      className="absolute inset-0 h-full w-full dark:opacity-[0.55]"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={sphere} cx="46%" cy="44%" r="64%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#f4f8f4" />
          <stop offset="62%" stopColor="#e7efe8" />
          <stop offset="88%" stopColor="#dde8df" />
          <stop offset="100%" stopColor="#d8e4da" />
        </radialGradient>

        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#cfe0d3" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#cfe0d3" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={rim} cx="50%" cy="50%" r="50%">
          <stop offset="82%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="95%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <filter id={blur} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <g transform="translate(620 620)">
        <circle r="600" fill={`url(#${glow})`} />
        <circle r="560" fill={`url(#${sphere})`} />
        <circle r="560" fill={`url(#${rim})`} />
        <circle r="560" fill="none" stroke="#ffffff" strokeWidth="14" opacity="0.5" filter={`url(#${blur})`} />
        <circle r="560" fill="none" stroke="#c8d8cb" strokeWidth="2" opacity="0.5" />
      </g>
    </svg>
  );
}
