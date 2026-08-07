// Deterministic organic "crumpled paper" blob shapes: a jittered ring of
// points, seeded per group so each of the 6 clusters looks distinct but
// stable across re-renders (no shape jitter on every paint).

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A closed, smoothly-interpolated irregular blob path centered on (0,0),
 * built from `points` jittered radii around a circle of the given radius —
 * the standard "organic blob" technique (quadratic curves through
 * midpoints). Same seed always produces the same shape. */
export function blobPath(seed: string, radius: number, points = 11, jitter = 0.32): string {
  const rand = mulberry32(hashSeed(seed));
  const angleStep = (Math.PI * 2) / points;
  const pts = Array.from({ length: points }, (_, i) => {
    const angle = i * angleStep;
    const r = radius * (1 - jitter / 2 + rand() * jitter);
    return [Math.cos(angle) * r, Math.sin(angle) * r] as const;
  });

  const mid = (a: readonly [number, number], b: readonly [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  const start = mid(pts[points - 1], pts[0]);
  let d = `M${start[0].toFixed(2)},${start[1].toFixed(2)} `;
  for (let i = 0; i < points; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % points];
    const m = mid(cur, next);
    d += `Q${cur[0].toFixed(2)},${cur[1].toFixed(2)} ${m[0].toFixed(2)},${m[1].toFixed(2)} `;
  }
  return `${d.trim()}Z`;
}
