// On a strongly flattened ellipse, equal ANGLE steps are not equal DISTANCE
// steps — points bunch up at the left and right extremes and collide. These
// two helpers let points on the taxonomy orbit be spaced by arc length
// instead, which keeps the gap between neighbours constant all the way
// around the path regardless of how flat the ellipse is.

export interface EllipseTable {
  cum: Float64Array;
  steps: number;
  total: number;
}

export function ellipseTable(rx: number, ry: number, steps = 1440): EllipseTable {
  const cum = new Float64Array(steps + 1);
  let prev: [number, number] = [0, -ry];
  for (let i = 1; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    const p: [number, number] = [Math.sin(a) * rx, -Math.cos(a) * ry];
    cum[i] = cum[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  return { cum, steps, total: cum[steps] };
}

export function angleAtArc(tbl: EllipseTable, s: number): number {
  const { cum, steps, total } = tbl;
  let t = s % total;
  if (t < 0) t += total;
  let lo = 0;
  let hi = steps;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= t) lo = mid;
    else hi = mid;
  }
  const seg = cum[hi] - cum[lo] || 1;
  return ((lo + (t - cum[lo]) / seg) / steps) * 2 * Math.PI;
}
