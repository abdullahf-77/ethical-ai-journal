// Small research papers drifting in from the edges of the orbit and being
// pulled into whichever planet they're assigned to — the "gravitational
// pull" motif requested for the Taxonomy Hub. Replaces the older static
// PlanetPaperCluster: instead of hovering near a planet, each paper now
// travels a full spawn -> flight -> absorption -> respawn lifecycle.
//
// Design notes (kept here since the mechanics are easy to re-derive wrong):
//
// - Each paper's SPAWN point is picked once and stays fixed for its whole
//   flight. Its TARGET is read live from `planets` every render, so if the
//   planet has moved since last frame, this frame's curve simply ends
//   somewhere new — the path "continuously updates" as the brief asked,
//   with no snapping because the shared orbit clock only ticks ~15x/sec and
//   planets barely move between ticks.
// - Progress `t` is linear in elapsed time (no easing applied to motion
//   itself), so the paper's speed along its curve stays constant — the
//   brief was explicit that it should not accelerate or decelerate as it
//   nears the planet. The only thing eased is the cosmetic scale/opacity
//   fade in the final stretch, which is a size/alpha change, not a speed
//   change.
// - The curve is a single quadratic Bezier from spawn to (live) target, bowed
//   out by a small, per-paper fixed fraction of the spawn-target distance.
//   Recomputing the same-shaped curve against a moving endpoint each tick is
//   what makes the path track a moving planet without any bespoke steering
//   logic.
// - Target assignment is by nearest planet: once a spawn point is picked,
//   the paper is assigned to whichever planet is currently closest to it
//   (straight-line distance at that instant), so it reads as being pulled
//   toward the principle it's nearest to rather than posted to an arbitrary
//   one. The target planet id itself doesn't change after that — only the
//   live coordinates of that one planet keep updating the flight path.
// - Everything freezes when `elapsed` stops advancing (orbit hover/focus/
//   reduced motion already pause the shared clock upstream), so papers hold
//   still exactly when the planets do.
// - The underlying Bezier still mathematically ends at the target's exact
//   center, but the RENDERED position is clamped (clampOutsideRadius) to
//   never come closer than `planetRadius` to it — so a paper visibly stops
//   and shrinks/fades away right at the planet's surface, not partway
//   inside it.

import { useMemo, useRef } from "react";
import { PaperGlyph } from "./TaxonomySpaceBackground";

interface LivePlanet {
  id: number;
  x: number;
  y: number;
  /** The planet's CURRENT on-screen radius, already including its depth
   * scale — a front planet is drawn much larger than a back one, so a
   * single flat radius would let papers sink deep inside the near ones. */
  radius: number;
}

interface FlyingPaper {
  id: number;
  targetId: number;
  spawnX: number;
  spawnY: number;
  /** Which side the curve bows out to, and by how much (fraction of the
   * spawn-target distance). Fixed for the paper's whole life. */
  bowSign: 1 | -1;
  bowStrength: number;
  size: number;
  rotate: number;
  lines: 2 | 3;
  opacityBase: number;
  /** Seconds for one full spawn-to-absorption journey. */
  duration: number;
  /** Shared-clock `elapsed` value when this journey began. */
  startElapsed: number;
}

const PAPER_COUNT = 30;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** One full loop around a rectangle JUST outside the clipped frame, by a
 * fixed margin only slightly larger than a paper. The old margin was a
 * percentage of the container (up to ~90px), which put spawn points far
 * outside the clip box — combined with a timed fade-in that meant a paper
 * only became visible once it was already well inside the frame, so it
 * looked like it materialised out of nowhere in open space instead of
 * drifting in past the edge. */
function randomEdgePoint(halfW: number, halfH: number) {
  const margin = 26;
  const w = halfW + margin;
  const h = halfH + margin;
  const perimeter = 2 * (w * 2) + 2 * (h * 2);
  let d = Math.random() * perimeter;
  if (d < w * 2) return { x: -w + d, y: -h };
  d -= w * 2;
  if (d < h * 2) return { x: w, y: -h + d };
  d -= h * 2;
  if (d < w * 2) return { x: w - d, y: h };
  d -= w * 2;
  return { x: -w, y: h - d };
}

/** Whichever planet is currently closest to (x, y), by straight-line
 * distance. Falls back to the first known planet if the list is somehow
 * empty (shouldn't happen — there are always ten domains). */
function nearestPlanetId(x: number, y: number, planets: LivePlanet[]): number {
  let bestId = planets[0]?.id ?? 0;
  let bestDist = Infinity;
  for (const p of planets) {
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      bestId = p.id;
    }
  }
  return bestId;
}

function makePaper(id: number, planets: LivePlanet[], startElapsed: number, halfW: number, halfH: number): FlyingPaper {
  const spawn = randomEdgePoint(halfW, halfH);
  return {
    id,
    targetId: nearestPlanetId(spawn.x, spawn.y, planets),
    spawnX: spawn.x,
    spawnY: spawn.y,
    bowSign: Math.random() > 0.5 ? 1 : -1,
    bowStrength: rand(0.14, 0.26),
    size: rand(12, 20),
    rotate: rand(-18, 18),
    lines: Math.random() > 0.5 ? 3 : 2,
    opacityBase: rand(0.28, 0.48),
    duration: rand(7, 12),
    startElapsed,
  };
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Pins (px, py) to the boundary of the `radius` circle around (tx, ty) if
 * it's currently inside it — used so a paper's rendered position stops at
 * the planet's surface instead of visibly continuing on to its exact
 * center. Falls back to (fbx, fby) as the approach direction for the rare
 * case where the raw point lands exactly on the target. */
function clampOutsideRadius(
  px: number,
  py: number,
  tx: number,
  ty: number,
  radius: number,
  fbx: number,
  fby: number,
) {
  let dx = px - tx;
  let dy = py - ty;
  let dist = Math.hypot(dx, dy);
  if (dist < 1e-3) {
    dx = fbx;
    dy = fby;
    dist = Math.hypot(dx, dy) || 1;
  }
  if (dist >= radius) return { x: px, y: py };
  const scale = radius / dist;
  return { x: tx + dx * scale, y: ty + dy * scale };
}

/** Point at parameter `t` along the quadratic Bezier from (sx,sy) to the
 * live (tx,ty), bowed by a fixed fraction of the current spawn-target
 * distance. Recomputed fresh every call, so a moving target simply
 * reshapes the curve rather than breaking it. */
function pointOnCurve(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  bowSign: number,
  bowStrength: number,
  t: number,
) {
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const bow = bowSign * dist * bowStrength;
  const cx = (sx + tx) / 2 + nx * bow;
  const cy = (sy + ty) / 2 + ny * bow;
  const u = 1 - t;
  return {
    x: u * u * sx + 2 * u * t * cx + t * t * tx,
    y: u * u * sy + 2 * u * t * cy + t * t * ty,
  };
}

interface PaperAttractionFieldProps {
  planets: LivePlanet[];
  elapsed: number;
  containerWidth: number;
  containerHeight: number;
  /** Hidden (opacity 0) during focus mode, where planets jump to pushed-out
   * / zoomed positions that no longer match the "natural" orbit targets
   * this field tracks. */
  hidden: boolean;
}

export function PaperAttractionField({
  planets,
  elapsed,
  containerWidth,
  containerHeight,
  hidden,
}: PaperAttractionFieldProps) {
  const halfW = containerWidth / 2;
  const halfH = containerHeight / 2;

  const papersRef = useRef<FlyingPaper[] | null>(null);
  if (!papersRef.current) {
    // Stagger initial start times so the field doesn't spawn/despawn in
    // visible unison — each paper begins somewhere between fresh and
    // nearly-arrived.
    papersRef.current = Array.from({ length: PAPER_COUNT }, (_, i) => {
      const p = makePaper(i, planets, 0, halfW, halfH);
      p.startElapsed = -Math.random() * p.duration;
      return p;
    });
  }

  const planetById = useMemo(() => {
    const map = new Map<number, LivePlanet>();
    for (const p of planets) map.set(p.id, p);
    return map;
  }, [planets]);

  // Slots that respawned on this exact tick — their position has to jump
  // (new spawn point, e.g. clear across the container) rather than glide,
  // so the CSS transition below is switched off for just that one render.
  const justRespawned = new Set<number>();
  const papers = papersRef.current.map((p, i) => {
    const progress = (elapsed - p.startElapsed) / p.duration;
    if (progress >= 1) {
      const fresh = makePaper(p.id, planets, elapsed, halfW, halfH);
      papersRef.current![i] = fresh;
      justRespawned.add(fresh.id);
      return fresh;
    }
    return p;
  });

  return (
    // Outer frame is sized to the container (inset-0) and clips — papers
    // deliberately spawn just outside the visible scene (see
    // randomEdgePoint's margin) so they can fly "in" from the edge, but
    // without a properly-sized clipping box that spawn point renders as an
    // orphaned paper out in blank page space instead. The inner div keeps
    // the existing center-anchored coordinate system every paper's x/y is
    // computed against.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out"
      style={{ zIndex: 3, opacity: hidden ? 0 : 1 }}
    >
      {/* Same shared `paper-art` ink/fill as the drifting background papers
          and the hero's artwork (see index.css) — these papers used the same
          flat, fully-opaque icaire-700 and so shared the "pasted-on layer"
          problem. */}
      <div className="paper-art absolute left-1/2 top-1/2">
        {papers.map((p) => {
        const target = planetById.get(p.targetId) ?? { x: 0, y: 0, radius: 0 };
        const t = clamp01((elapsed - p.startElapsed) / p.duration);
        const raw = pointOnCurve(p.spawnX, p.spawnY, target.x, target.y, p.bowSign, p.bowStrength, t);
        // Stop at the planet's surface — the raw curve mathematically ends
        // at its exact center, but the paper should read as landing on it
        // and vanishing there, not visibly sinking into the middle.
        const { x, y } = clampOutsideRadius(
          raw.x,
          raw.y,
          target.x,
          target.y,
          target.radius,
          p.spawnX - target.x,
          p.spawnY - target.y,
        );

        // Absorption is driven by DISTANCE to the planet, not by elapsed
        // time. Tying it to `t` (the old "last 15% of the journey") meant a
        // paper started vanishing at a fixed point on its timeline no matter
        // where it actually was — and since the target planet keeps orbiting,
        // that moment often landed while the paper was still far from any
        // planet. Keyed to distance, a paper is always at full strength until
        // it is genuinely near its planet, and reaches zero exactly at the
        // surface.
        const distToPlanet = Math.hypot(raw.x - target.x, raw.y - target.y);
        const fadeBand = Math.max(target.radius, 1) * 0.85;
        const approach = clamp01((distToPlanet - target.radius) / fadeBand);
        // A fresh spawn is far from any planet, so `approach` alone starts
        // at ~1 — full opacity the instant a paper respawns, which reads as
        // popping into existence rather than drifting in. Ramping a second
        // multiplier over just the first 8% of the journey (well under a
        // second, even on the longest 12s flights) gives it a quick, smooth
        // fade-in without slowing the respawn down.
        const spawnFade = clamp01(t / 0.08);
        const scaleMul = 0.32 + 0.68 * approach;
        const opacityMul = approach * spawnFade;

        // Fixed base box, positioned/scaled entirely through `transform` —
        // that's what lets a short CSS transition smooth the ~15fps position
        // updates into what reads as continuous, constant-speed motion,
        // rather than the visible per-tick jump a `left`/`top` update gives.
        const w = p.size;
        const h = w * (34 / 26);

        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: -w / 2,
              top: -h / 2,
              width: w,
              height: h,
              opacity: p.opacityBase * opacityMul,
              transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${p.rotate}deg) scale(${scaleMul.toFixed(3)})`,
              // Interpolates between position updates. Kept just above the
              // shared clock's tick interval (now full frame-rate, ~16ms) —
              // much longer and the paper visibly trails its own path
              // instead of simply being smoothed between ticks.
              transition: justRespawned.has(p.id)
                ? "none"
                : "transform 20ms linear, opacity 120ms linear",
              willChange: "transform, opacity",
            }}
          >
            <PaperGlyph lines={p.lines} />
          </div>
        );
        })}
      </div>
    </div>
  );
}
