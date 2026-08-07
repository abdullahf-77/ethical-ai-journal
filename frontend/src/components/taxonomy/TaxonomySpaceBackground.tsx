// Purely decorative "knowledge universe" backdrop for the Taxonomy Hub page.
// Sits behind the heading and the domain orbit as three loose depth layers —
// far (grid + huge static arcs + tiny faint papers), mid (papers + particle
// dots), near (a few larger papers close to the edges). Nothing here is
// interactive: pointer-events are disabled throughout, and every animated
// element lives under [data-space-bg], which index.css silences entirely
// under prefers-reduced-motion.
//
// Deliberately framework-light — same raw SVG/CSS-animation approach as
// HeroArt.tsx, just with CSS custom properties (--dx/--dy) driving the
// `drift` keyframe so each paper can have its own wander distance without a
// bespoke keyframe per element.

import type { CSSProperties } from "react";

type Hide = "sm" | "md" | undefined;

interface PaperSpec {
  x: number; // percent, left
  y: number; // percent, top
  size: number; // px, width (height follows the doc's aspect ratio)
  rotate: number; // deg
  opacity: number;
  dur: number; // seconds
  delay: number; // seconds
  dx: number; // px drift
  dy: number; // px drift
  lines: 2 | 3;
  hide?: Hide;
}

interface DotSpec {
  x: number;
  y: number;
  size: number; // px diameter
  opacity: number;
  pulse?: { dur: number; delay: number };
  hide?: Hide;
}

interface OrbitSpec {
  style: CSSProperties;
  opacity: number;
  hide?: Hide;
}

// Far layer: barely-there, mostly hidden below md to keep small screens calm.
// Sized down so these read as tiny, distant specks rather than objects.
// Sizes across all three layers are kept close to the hero's constant 26x34
// document rather than spanning 8px to 30px as they used to. In the hero every
// paper is drawn at one scale, so wildly different sizes here were a large part
// of why these read as a separate layer; depth is now carried mostly by opacity
// (as the hero does with its faded cluster docs) and only gently by size.
const farPapers: PaperSpec[] = [
  { x: 7, y: 7, size: 15, rotate: -10, opacity: 0.2, dur: 26, delay: 0, dx: 6, dy: -8, lines: 3 },
  { x: 92, y: 6, size: 16, rotate: 12, opacity: 0.18, dur: 30, delay: 3, dx: -7, dy: 9, lines: 2, hide: "md" },
  { x: 4, y: 89, size: 15, rotate: 8, opacity: 0.19, dur: 28, delay: 6, dx: 8, dy: 6, lines: 3, hide: "md" },
  { x: 95, y: 92, size: 14, rotate: -14, opacity: 0.17, dur: 24, delay: 2, dx: -6, dy: -7, lines: 2 },
  { x: 74, y: 3, size: 14, rotate: 6, opacity: 0.16, dur: 32, delay: 8, dx: 5, dy: 5, lines: 3, hide: "md" },
];

// Mid layer: the bulk of the papers — still light and ambient, not objects
// that compete with the planets for attention.
const midPapers: PaperSpec[] = [
  { x: 10, y: 23, size: 20, rotate: -8, opacity: 0.34, dur: 22, delay: 1, dx: 10, dy: -10, lines: 3 },
  { x: 88, y: 19, size: 21, rotate: 10, opacity: 0.32, dur: 24, delay: 4, dx: -9, dy: 8, lines: 3 },
  { x: 6, y: 55, size: 22, rotate: 6, opacity: 0.36, dur: 20, delay: 2, dx: 8, dy: 9, lines: 2 },
  { x: 93, y: 58, size: 21, rotate: -11, opacity: 0.34, dur: 26, delay: 5, dx: -8, dy: -6, lines: 3, hide: "sm" },
  { x: 14, y: 83, size: 20, rotate: 9, opacity: 0.3, dur: 23, delay: 3, dx: 7, dy: -8, lines: 3 },
  { x: 85, y: 86, size: 20, rotate: -6, opacity: 0.32, dur: 25, delay: 7, dx: -7, dy: 7, lines: 2, hide: "sm" },
  { x: 79, y: 6, size: 19, rotate: 13, opacity: 0.26, dur: 21, delay: 1.5, dx: 6, dy: 6, lines: 3, hide: "md" },
];

// Near layer: the largest papers here, but still modest — light, ambient
// research paper silhouettes, not prominent foreground objects. A couple are
// deliberately clipped by the viewport edge (x below 0 or above 100).
const nearPapers: PaperSpec[] = [
  { x: -1, y: 39, size: 27, rotate: -9, opacity: 0.5, dur: 28, delay: 0, dx: 10, dy: -9, lines: 3 },
  { x: 99, y: 43, size: 26, rotate: 8, opacity: 0.46, dur: 30, delay: 3, dx: -9, dy: 8, lines: 3 },
  { x: -2, y: 71, size: 25, rotate: 7, opacity: 0.42, dur: 26, delay: 6, dx: 9, dy: 7, lines: 2, hide: "sm" },
  { x: 100, y: 76, size: 27, rotate: -12, opacity: 0.48, dur: 32, delay: 2, dx: -10, dy: -8, lines: 3, hide: "sm" },
];

// A calm "knowledge-universe" star field: a stratified grid of cells, each
// contributing at most one dot with jittered placement, so coverage stays
// even instead of clumping the way pure randomness would. The center band
// (roughly behind the heading and the orbit) is thinned out hard so the
// core composition stays readable; the outer margins stay dense enough to
// read as a field of stars. The seed is fixed so the layout is stable
// across renders/reloads rather than reshuffling.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDots(): DotSpec[] {
  const rand = mulberry32(20260806);
  // Finer grid + lighter thinning than before — more random dots scattered
  // across the page. The center is still thinned harder than the edges so
  // the heading/orbit stay readable, just less aggressively than before.
  const cols = 11;
  const rows = 9;
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const list: DotSpec[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * cellW + cellW / 2;
      const cy = r * cellH + cellH / 2;
      const inCenter = cx > 22 && cx < 78 && cy > 12 && cy < 78;
      // Thin the center (keep it readable), thin the edges only lightly
      // (keep the field feeling like scattered stars, not a wall of dots).
      if (rand() < (inCenter ? 0.55 : 0.04)) continue;

      const x = Math.min(99, Math.max(1, cx + (rand() - 0.5) * cellW * 0.85));
      const y = Math.min(99, Math.max(1, cy + (rand() - 0.5) * cellH * 0.85));
      const size = Number((inCenter ? 1 + rand() * 1.0 : 1.2 + rand() * 1.5).toFixed(2));
      const opacity = Number(((inCenter ? 0.09 : 0.15) + rand() * (inCenter ? 0.12 : 0.22)).toFixed(2));
      const pulse = rand() < 0.22 ? { dur: 16 + rand() * 18, delay: Number((rand() * 8).toFixed(1)) } : undefined;
      const hide: Hide = inCenter ? "md" : rand() < 0.3 ? "sm" : undefined;

      list.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), size, opacity, pulse, hide });
    }
  }
  return list;
}

const dots: DotSpec[] = generateDots();

// Two huge, mostly-static dashed rings anchored at opposite corners, largely
// off-canvas, to suggest a wider orbital system beyond the visible page.
const orbits: OrbitSpec[] = [
  { style: { left: "-16%", top: "-24%", width: 560, height: 560 }, opacity: 0.16 },
  { style: { right: "-18%", bottom: "-22%", width: 620, height: 460 }, opacity: 0.14, hide: "sm" },
];

function hideClass(hide?: Hide) {
  if (hide === "sm") return "hidden sm:block";
  if (hide === "md") return "hidden md:block";
  return "";
}

/** Exported so PaperAttractionField.tsx can draw the same glyph at
 * planet-relative sizes without duplicating the SVG. Matches HeroArt.tsx's
 * RidingDoc/ClusterDoc treatment exactly (same 26x34 card proportions, same
 * rx/strokeWidth, same graduated line opacities) — a solid near-opaque card
 * (--art-fill, shared with the hero) rather than a hollow outline. At the
 * hollow-outline version's smallest render size (8-9px) a sub-1px stroke on
 * a rotated shape anti-aliased unevenly at the rounded corner, which read as
 * a stray diagonal fleck; a filled card doesn't have that failure mode. */
export function PaperGlyph({ lines }: { lines: 2 | 3 }) {
  return (
    <svg viewBox="0 0 26 34" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Geometry, radius, stroke weight and line opacities are copied from
          HeroArt's RidingDoc/ClusterDoc so the two read as the same object.
          vectorEffect="non-scaling-stroke" is the piece that actually makes
          them match on screen: this glyph is drawn at anywhere from ~14px to
          ~30px wide, and without it the 1.3-unit stroke scaled with the box —
          rendering as a hairline sub-pixel edge on the small papers and a
          heavy outline on the large ones. Pinning the stroke to 1.3 device
          pixels reproduces the hero, where every doc is drawn at one size. */}
      <rect
        x="1"
        y="1"
        width="24"
        height="32"
        rx="3.5"
        fill="var(--art-fill)"
        stroke="currentColor"
        strokeWidth="1.3"
        vectorEffect="non-scaling-stroke"
      />
      <rect x="6" y="9" width="14" height="1.6" rx="0.8" fill="currentColor" opacity="0.74" />
      <rect x="6" y="14.5" width="10" height="1.6" rx="0.8" fill="currentColor" opacity="0.59" />
      {lines === 3 && <rect x="6" y="20" width="12" height="1.6" rx="0.8" fill="currentColor" opacity="0.59" />}
    </svg>
  );
}

function Paper({ spec }: { spec: PaperSpec }) {
  const outerStyle: CSSProperties = {
    left: `${spec.x}%`,
    top: `${spec.y}%`,
    width: spec.size,
    height: spec.size * (34 / 26),
    ["--dx" as string]: `${spec.dx}px`,
    ["--dy" as string]: `${spec.dy}px`,
    // The fade multiplies with the inner div's fixed opacity below (nested
    // opacity is visually multiplicative), so this fades 0 -> spec.opacity
    // rather than needing to know that value itself. Reuses spec.delay so
    // papers still fade in staggered rather than all at once.
    animation: `fade-in-paper 0.5s ease-out ${spec.delay}s both, drift ${spec.dur}s ease-in-out ${spec.delay}s infinite`,
  };
  return (
    <div className={`absolute ${hideClass(spec.hide)}`} style={outerStyle}>
      <div style={{ transform: `rotate(${spec.rotate}deg)`, opacity: spec.opacity }}>
        <PaperGlyph lines={spec.lines} />
      </div>
    </div>
  );
}

function Dot({ spec }: { spec: DotSpec }) {
  const style: CSSProperties = {
    left: `${spec.x}%`,
    top: `${spec.y}%`,
    width: spec.size,
    height: spec.size,
    opacity: spec.opacity,
    animation: spec.pulse ? `breathe ${spec.pulse.dur}s ease-in-out ${spec.pulse.delay}s infinite` : undefined,
  };
  return <span className={`absolute rounded-full bg-current ${hideClass(spec.hide)}`} style={style} />;
}

function Orbit({ spec }: { spec: OrbitSpec }) {
  const style: CSSProperties = {
    ...spec.style,
    opacity: spec.opacity,
    borderColor: "currentColor",
  };
  return <div className={`absolute rounded-full border border-dashed ${hideClass(spec.hide)}`} style={style} />;
}

export function TaxonomySpaceBackground() {
  return (
    // paper-art carries the hero's exact ink colour and --art-fill (see
    // index.css) instead of the flat, fully-opaque icaire-700 this used
    // before — that opacity mismatch is the main reason these papers read as
    // a sticker layer over the page rather than part of the hero's world.
    // paper-art-veil softens the outer edge so papers drift out of frame
    // instead of being sliced by the container, the same trick the hero uses
    // on its fan cluster.
    <div
      data-space-bg=""
      aria-hidden="true"
      className="paper-art paper-art-veil pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* layer 1 (far): grid + huge static orbital rings */}
      <div className="bg-grid absolute inset-0 opacity-70" />
      {orbits.map((o, i) => (
        <Orbit key={i} spec={o} />
      ))}
      {farPapers.map((p, i) => (
        <Paper key={`far-${i}`} spec={p} />
      ))}

      {/* layer 2 (mid): normal papers + particle dots */}
      {dots.map((d, i) => (
        <Dot key={`dot-${i}`} spec={d} />
      ))}
      {midPapers.map((p, i) => (
        <Paper key={`mid-${i}`} spec={p} />
      ))}

      {/* layer 3 (near): larger, more visible papers close to the edges */}
      {nearPapers.map((p, i) => (
        <Paper key={`near-${i}`} spec={p} />
      ))}
    </div>
  );
}
