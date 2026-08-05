/**
 * The pale sage-green translucent sphere used for every domain planet — the
 * same composition as public/taxonomy-orb.svg (radial sage gradient, soft
 * rim light, diffused halo, thin crossing orbit rings with small dots),
 * minus that file's opaque background and grid so it can sit on the page.
 *
 * The whole composition is scaled to fill the box: at the source's own
 * scale the rings reach r≈481 out of a 620 half-viewBox, so scaling by
 * 620/481 puts the outermost ring just inside the edge.
 *
 * Ring strokes use non-scaling-stroke — at a ~104px render the source's
 * 1.4-unit stroke would otherwise compute to well under a tenth of a pixel
 * and disappear entirely.
 *
 * Gradient ids are suffixed per instance because several of these render on
 * the same page and SVG defs share a document-wide id namespace.
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

      <g transform="translate(620 620) scale(1.288)">
        <circle r="470" fill={`url(#${glow})`} />

        <circle r="432" fill={`url(#${sphere})`} />
        <circle r="432" fill={`url(#${rim})`} />
        <circle r="432" fill="none" stroke="#ffffff" strokeWidth="11" opacity="0.5" filter={`url(#${blur})`} />
        <circle r="432" fill="none" stroke="#c8d8cb" strokeWidth="1.5" opacity="0.45" />

        {/* thin crossing orbit rings; each dot is inside its ring's rotated
            group so it lands exactly on that ellipse's path */}
        <g stroke="#7f9d85" fill="#8db095" opacity="0.5">
          <g transform="rotate(-27)">
            <ellipse rx="472" ry="300" fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx="-372" cy="-184" r="17" stroke="none" />
            <circle cx="447" cy="96" r="13" stroke="none" />
          </g>

          <g transform="rotate(34)">
            <ellipse rx="466" ry="258" fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx="-402" cy="130" r="14" stroke="none" />
            <circle cx="326" cy="-184" r="19" stroke="none" />
          </g>

          <g transform="rotate(12)">
            <ellipse rx="292" ry="470" fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx="-146" cy="-407" r="15" stroke="none" />
            <circle cx="106" cy="437" r="21" stroke="none" />
          </g>

          <g transform="rotate(-62)">
            <ellipse
              rx="452"
              ry="418"
              fill="none"
              strokeWidth="1"
              opacity="0.8"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx="-226" cy="-362" r="12" stroke="none" />
            <circle cx="391" cy="209" r="15" stroke="none" />
          </g>
        </g>
      </g>
    </svg>
  );
}
