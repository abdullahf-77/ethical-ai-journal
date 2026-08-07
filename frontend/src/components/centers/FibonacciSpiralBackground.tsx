import { motion } from "framer-motion";
import { goldenSquareSizes, spiralPathD } from "../../lib/spiral";

const EASE = [0.16, 1, 0.3, 1] as const;

// Nested "golden rectangle" squares, largest first, each shrinking by 1/PHI.
// Drawn edge-to-edge along the bottom-right growth direction the spiral
// itself sweeps through, purely as the classic decorative scaffold behind
// the curve — same visual grammar as the dashed orbit ellipse in
// TaxonomyUniverse, just golden-ratio flavored instead of circular.
const SQUARES = goldenSquareSizes(620, 8);

function squareRects() {
  let x = -310;
  let y = -310;
  return SQUARES.map((size, i) => {
    const rect = { x, y, size };
    // Walk counter-clockwise: right, down, left, up, repeating — each
    // square tucked into the remaining space of the last.
    switch (i % 4) {
      case 0:
        x += size;
        break;
      case 1:
        y += size;
        break;
      case 2:
        x -= SQUARES[i + 1] ?? 0;
        break;
      case 3:
        y -= SQUARES[i + 1] ?? 0;
        break;
    }
    return rect;
  });
}

/** The static golden-ratio spiral + nested squares that stage 3 of the
 * centers intro morphs into, and which stays as the page's background once
 * the cluster nodes (stage 4) are in place. Purely decorative — aria-hidden. */
export function FibonacciSpiralBackground({ visible }: { visible: boolean }) {
  const path = spiralPathD(-360, 640, 6);
  const rects = squareRects();

  return (
    <motion.svg
      viewBox="-500 -500 1000 1000"
      className="pointer-events-none absolute inset-0 h-full w-full text-icaire-700/[0.16] dark:text-icaire-400/[0.22]"
      aria-hidden="true"
      focusable="false"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      {rects.map((r, i) => (
        <rect
          key={i}
          x={r.x}
          y={r.y}
          width={r.size}
          height={r.size}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      ))}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </motion.svg>
  );
}
