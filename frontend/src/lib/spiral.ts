// Golden-ratio (Fibonacci) logarithmic spiral math, shared by
// FibonacciSpiralBackground (the static decorative path + nested squares)
// and GroupCluster (node placement along the spiral).

export const PHI = 1.618033988749895;

/** The angle between successive points on a phyllotaxis spiral (sunflower
 * seed pattern) that keeps them evenly fanned out with no two points ever
 * landing on the same ray from the center. */
export const GOLDEN_ANGLE_DEG = 360 * (1 - 1 / PHI);

/** b in r = a * e^(b*theta): the growth-rate constant that doubles the
 * radius every `growthPerTurn` factor across one full turn (2*PI radians). */
function growthConstant(growthPerTurn: number) {
  return Math.log(growthPerTurn) / (2 * Math.PI);
}

export function spiralRadius(angleDeg: number, a = 1, growthPerTurn = PHI): number {
  const angleRad = (angleDeg * Math.PI) / 180;
  return a * Math.exp(growthConstant(growthPerTurn) * angleRad);
}

export function spiralPoint(angleDeg: number, a = 1, growthPerTurn = PHI): { x: number; y: number; r: number } {
  const r = spiralRadius(angleDeg, a, growthPerTurn);
  const rad = (angleDeg * Math.PI) / 180;
  return { x: r * Math.cos(rad), y: r * Math.sin(rad), r };
}

/** An SVG path `d` string tracing the spiral from startAngle to endAngle
 * (degrees), sampled every ~4 degrees — smooth enough for a decorative
 * background line at any reasonable viewBox size. */
export function spiralPathD(startAngle: number, endAngle: number, a = 1, growthPerTurn = PHI): string {
  const steps = Math.max(2, Math.round(Math.abs(endAngle - startAngle) / 4));
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps;
    const { x, y } = spiralPoint(angle, a, growthPerTurn);
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return parts.join(" ");
}

/** Side lengths of the nested "golden rectangle" squares that classically
 * accompany a golden spiral illustration, each `1/PHI` the size of the last,
 * starting from `first` and stopping once a square would round to 0. */
export function goldenSquareSizes(first: number, count: number): number[] {
  const sizes: number[] = [];
  let size = first;
  for (let i = 0; i < count; i++) {
    sizes.push(size);
    size /= PHI;
  }
  return sizes;
}

/** Places `count` points along the spiral at golden-angle increments (the
 * same phyllotaxis rule sunflower seeds follow), so they fan out from the
 * center with no overlap and a naturally increasing radius. `startAngle`
 * rotates the whole fan; `a`/`growthPerTurn` control spacing/size. */
export function clusterPositions(
  count: number,
  { a = 1, growthPerTurn = PHI, startAngle = 0 }: { a?: number; growthPerTurn?: number; startAngle?: number } = {},
): { angleDeg: number; x: number; y: number; r: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const angleDeg = startAngle + i * GOLDEN_ANGLE_DEG;
    return { angleDeg, ...spiralPoint(angleDeg, a, growthPerTurn) };
  });
}
