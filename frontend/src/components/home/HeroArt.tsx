// Decorative hero artwork ported from the Claude Design source: papers riding
// flow lines from the left, converging into a fan of indexed document clusters
// on the right (the design's "fan" hero-illustration variant). Desktop-only —
// hidden below lg to keep the responsive hero clean.

const flowPaths = [
  { d: "M 136 101 C 273.6 151.2, 400.5 160.2, 561.5 115.8", dash: "7.3 9.0", dur: 7.3 },
  { d: "M 214 51 C 359.4 0.1, 451.7 98.8, 592.8 92.9", dash: "4.8 6.1", dur: 6.9 },
  { d: "M 122 213 C 242.9 211.5, 421.5 200.7, 506.7 183.5", dash: "4.5 6.1", dur: 8.7 },
  { d: "M 240 167 C 387.2 160.7, 466.8 179.1, 522.2 158.8", dash: "6.8 6.2", dur: 5.6 },
  { d: "M 130 333 C 244.1 269.0, 415.5 320.0, 478.7 270.9", dash: "8.1 7.3", dur: 9.0 },
  { d: "M 258 285 C 355.0 224.4, 428.6 237.6, 487.9 228.2", dash: "5.2 10.1", dur: 7.7 },
  { d: "M 156 415 C 291.9 443.7, 407.6 335.9, 485.2 362.5", dash: "8.2 7.2", dur: 6.3 },
  { d: "M 272 389 C 334.3 432.5, 430.9 275.4, 478.2 324.3", dash: "4.2 9.5", dur: 7.3 },
  { d: "M 126 517 C 248.2 569.4, 454.1 459.7, 522.2 441.2", dash: "4.1 7.4", dur: 5.7 },
  { d: "M 248 503 C 370.1 510.0, 438.4 370.9, 502.3 407.9", dash: "7.7 7.0", dur: 7.6 },
  { d: "M 192 583 C 379.9 603.3, 442.1 439.7, 561.5 484.2", dash: "7.0 8.3", dur: 6.1 },
  { d: "M 318 77 C 438.5 100.9, 462.9 135.0, 547.2 129.1", dash: "4.1 7.7", dur: 5.8 },
];

const ridingDots = [
  { d: "M 152 128 C 310.8 104.5, 448.1 89.2, 534.1 143.5", r: 2.2, dur: 8.4 },
  { d: "M 262 96 C 428.8 99.3, 485.1 103.3, 568.9 109.7", r: 1.6, dur: 6.7 },
  { d: "M 92 258 C 270.3 295.4, 401.0 188.3, 494.3 209.9", r: 2.6, dur: 7.4 },
  { d: "M 292 226 C 371.9 276.9, 447.5 189.8, 502.3 192.1", r: 1.8, dur: 7.5 },
  { d: "M 166 350 C 300.1 376.5, 359.3 305.9, 477 300", r: 1.6, dur: 7.0 },
  { d: "M 280 330 C 378.1 328.1, 421.6 267.6, 477.4 285.4", r: 2.4, dur: 8.6 },
  { d: "M 96 452 C 303.4 474.5, 368.4 437.7, 492.6 385.6", r: 1.8, dur: 6.1 },
  { d: "M 312 424 C 393.4 429.7, 436.0 332.8, 482.9 353", r: 1.6, dur: 9.2 },
  { d: "M 140 556 C 307.4 491.9, 434.7 408.8, 537.3 460.2", r: 2.2, dur: 7.0 },
  { d: "M 294 540 C 397.1 532.5, 446.8 474.2, 514.1 429.1", r: 1.7, dur: 6.8 },
  { d: "M 330 160 C 416.3 134.5, 495.2 103.4, 528 151", r: 2, dur: 9.0 },
  { d: "M 326 480 C 377.3 477.2, 443.4 346.4, 496.2 394.6", r: 2.3, dur: 8.3 },
];

const ridingDocs = [
  { rotate: -12, dur: 7.7 },
  { rotate: 8, dur: 7.4 },
  { rotate: 6, dur: 9.7 },
  { rotate: -9, dur: 9.4 },
  { rotate: 10, dur: 9.9 },
  { rotate: -6, dur: 9.3 },
  { rotate: -8, dur: 10.9 },
  { rotate: 7, dur: 8.0 },
  { rotate: 5, dur: 8.9 },
  { rotate: -10, dur: 11.1 },
  { rotate: 5, dur: 10.0 },
  { rotate: 4, dur: 7.9 },
];

// Fan motif: one trunk line feeds a hub that fans out into six branches, each
// ending in a cluster of three archived documents.
const fanTrunk = "M 242.8 290.3 C 276.8 278.3, 276 308, 316 300";

const fanBranches = [
  { d: "M 316 300 C 390 268.8, 363.1 88, 459.1 88", end: [459.1, 88], dash: "4.1 6.1", flowDur: 11.0, breatheDur: 24 },
  { d: "M 316 300 C 390 281.3, 375.9 173, 471.9 173", end: [471.9, 173], dash: "5.8 7.4", flowDur: 12.6, breatheDur: 26 },
  { d: "M 316 300 C 390 293.8, 388.7 258, 484.7 258", end: [484.7, 258], dash: "4.2 7.7", flowDur: 14.2, breatheDur: 28 },
  { d: "M 316 300 C 390 306.5, 388.4 344, 484.4 344", end: [484.4, 344], dash: "5.0 7.8", flowDur: 15.8, breatheDur: 30 },
  { d: "M 316 300 C 390 319.0, 375.6 429, 471.6 429", end: [471.6, 429], dash: "4.9 7.1", flowDur: 17.4, breatheDur: 32 },
  { d: "M 316 300 C 390 331.5, 362.8 514, 458.8 514", end: [458.8, 514], dash: "4.0 7.3", flowDur: 19.0, breatheDur: 34 },
];

const floatDots = [
  { x: 453.1, y: 359.8, r: 1.5, dur: 28.2 },
  { x: 588.5, y: 368.2, r: 2.1, dur: 28.4 },
  { x: 580.4, y: 305.1, r: 1.8, dur: 24.1 },
  { x: 454, y: 363.8, r: 1.3, dur: 22.2 },
  { x: 567.2, y: 529.2, r: 2.3, dur: 31.7 },
  { x: 508.4, y: 408.3, r: 1.5, dur: 28.9 },
  { x: 435.3, y: 532.4, r: 1.2, dur: 31.3 },
  { x: 385.7, y: 504.9, r: 1.2, dur: 31.4 },
  { x: 331.8, y: 373, r: 2.3, dur: 35.6 },
  { x: 518, y: 133.1, r: 2.1, dur: 31.0 },
  { x: 497.3, y: 208.7, r: 1.7, dur: 34.5 },
  { x: 501.8, y: 452.8, r: 1.7, dur: 30.2 },
  { x: 467.7, y: 324.1, r: 1.3, dur: 28.1 },
  { x: 499.5, y: 132.6, r: 1.1, dur: 23.4 },
  { x: 588.8, y: 510.1, r: 2.0, dur: 24.7 },
  { x: 523.5, y: 195.8, r: 1.7, dur: 28.0 },
  { x: 590.5, y: 76.8, r: 2.0, dur: 33.2 },
  { x: 575.6, y: 101.1, r: 2.0, dur: 29.1 },
  { x: 504.4, y: 523.3, r: 2.4, dur: 32.9 },
  { x: 374.9, y: 445.7, r: 1.9, dur: 33.2 },
];

// Journey docs travel the trunk, then branches 1/3/5, into the first cluster slot.
const journeyBranchIndexes = [0, 2, 4];

// 5 slots per branch (was 3) — a fuller-looking archive at each branch end.
// The mask on the second HeroArt layer already fades anything past ~70% of
// its radius, so the extra, farther-out slots recede on their own rather
// than needing to be dimmed by hand.
const clusterSlots = [0, 1, 2, 3, 4];

// Small independent wander per static cluster doc, cycled across slots/
// branches by index so neighbouring docs don't drift in lockstep — see the
// `float` prop on ClusterDoc for how this composes with the outer SVG's own
// shared 34s bob.
const clusterFloat: ClusterFloat[] = [
  { dx: 3, dy: -4, dur: 17, delay: 0 },
  { dx: -3, dy: 4, dur: 21, delay: 1.4 },
  { dx: 4, dy: 3, dur: 19, delay: 2.6 },
  { dx: -4, dy: -3, dur: 23, delay: 0.8 },
  { dx: 3, dy: 4, dur: 20, delay: 3.2 },
];

function RidingDoc() {
  return (
    <>
      <rect x="-13" y="-17" width="26" height="34" rx="3" fill="var(--art-fill)" stroke="currentColor" strokeWidth="1.3" />
      <rect x="-8" y="-10" width="16" height="1.6" rx="0.8" fill="currentColor" opacity="0.75" />
      <rect x="-8" y="-4" width="12" height="1.6" rx="0.8" fill="currentColor" opacity="0.6" />
      <rect x="-8" y="2" width="15" height="1.6" rx="0.8" fill="currentColor" opacity="0.6" />
    </>
  );
}

interface ClusterFloat {
  dx: number;
  dy: number;
  dur: number;
  delay: number;
}

function ClusterDoc({
  x,
  y,
  faded,
  float,
}: {
  x?: number;
  y?: number;
  faded: boolean;
  /** Small independent wander for the static cluster docs, on top of
   * whatever positioning transform is passed via x/y — see the comment
   * where these are laid out below for why. */
  float?: ClusterFloat;
}) {
  // faded was 0.55/0.43/0.34 — visibly dimmer than the hero's own non-faded
  // tier, which read as weak/washed out once these clusters became the
  // reference other decorative papers in the product are matched against.
  const rectOpacity = faded ? 0.72 : 0.95;
  const line1 = faded ? 0.56 : 0.74;
  const line2 = faded ? 0.46 : 0.59;
  const doc = (
    <>
      <rect
        x="-13"
        y="-17"
        width="26"
        height="34"
        rx="3.5"
        fill="var(--art-fill)"
        stroke="currentColor"
        strokeWidth={faded ? 1.25 : 1.35}
        opacity={rectOpacity}
      />
      <rect x="-8" y="-10" width="16" height="1.6" rx="0.8" fill="currentColor" opacity={line1} />
      <rect x="-8" y="-4" width="12" height="1.6" rx="0.8" fill="currentColor" opacity={line2} />
      <rect x="-8" y="2" width="15" height="1.6" rx="0.8" fill="currentColor" opacity={line2} />
    </>
  );
  if (x === undefined || y === undefined) return doc;
  if (!float) return <g transform={`translate(${x} ${y})`}>{doc}</g>;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Nested so the outer translate (fixed slot position) and the inner
          drift (independent wander) don't fight over one `transform`. Reuses
          the shared `drift` keyframe — same one the Taxonomy Hub's
          background papers use — so a static cluster no longer reads as one
          rigid block bobbing together (that's still the outer SVG's own
          slow `float`); each doc now also wanders a little on its own. */}
      <g
        style={{
          ["--dx" as string]: `${float.dx}px`,
          ["--dy" as string]: `${float.dy}px`,
          transformBox: "fill-box",
          animation: `drift ${float.dur}s ease-in-out ${float.delay}s infinite`,
        }}
      >
        {doc}
      </g>
    </g>
  );
}

export function HeroArt() {
  return (
    <>
      <div
        aria-hidden="true"
        className="hero-art pointer-events-none absolute left-[calc(50%-720px)] top-1/2 hidden h-[600px] w-[720px] -translate-y-1/2 opacity-85 lg:block"
      >
        <svg viewBox="0 0 720 600" className="h-full w-full">
          {flowPaths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.1"
              opacity="0.28"
              strokeDasharray={p.dash}
              style={{ animation: `flow ${p.dur}s linear infinite` }}
            />
          ))}
          {ridingDots.map((c, i) => (
            <circle
              key={i}
              cx="0"
              cy="0"
              r={c.r}
              fill="currentColor"
              opacity="0.7"
              style={{
                offsetPath: `path('${c.d}')`,
                offsetRotate: "0deg",
                animation: `ride ${c.dur}s linear ${(i * 0.47).toFixed(2)}s infinite backwards`,
              }}
            />
          ))}
          {ridingDocs.map((doc, i) => (
            <g
              key={i}
              style={{
                offsetPath: `path('${flowPaths[i].d}')`,
                offsetRotate: "0deg",
                animation: `ride ${doc.dur}s linear ${(i * 0.66).toFixed(2)}s infinite backwards`,
              }}
            >
              <g transform={`rotate(${doc.rotate})`}>
                <RidingDoc />
              </g>
            </g>
          ))}
        </svg>
      </div>

      <div
        aria-hidden="true"
        className="hero-art pointer-events-none absolute left-1/2 top-1/2 hidden h-[600px] w-[720px] -translate-y-1/2 opacity-85 lg:block"
        style={{
          maskImage: "radial-gradient(ellipse 78% 92% at 64% 50%, black 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 78% 92% at 64% 50%, black 70%, transparent 100%)",
        }}
      >
        <svg
          viewBox="0 0 720 600"
          className="h-full w-full"
          style={{ animation: "float 34s ease-in-out infinite" }}
        >
          <path
            d={fanTrunk}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.35"
            strokeDasharray="5 8"
            opacity="0.46"
            style={{ animation: "flow 16s linear infinite" }}
          />
          <circle cx="316" cy="300" r="4" fill="currentColor" opacity="0.5" />
          {fanBranches.map((b, i) => (
            <g key={i}>
              <path
                d={b.d}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.2"
                strokeDasharray={b.dash}
                opacity="0.4"
                style={{
                  animation: `flow ${b.flowDur}s linear infinite, breathe ${b.breatheDur}s ease-in-out ${(i * 1.7).toFixed(1)}s infinite backwards`,
                }}
              />
              <circle cx={b.end[0]} cy={b.end[1]} r="2.2" fill="currentColor" opacity="0.42" />
            </g>
          ))}
          {floatDots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="currentColor"
              opacity="0.45"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `float ${d.dur}s ease-in-out ${(i * 1.1).toFixed(1)}s infinite`,
              }}
            />
          ))}
          <circle
            cx="0"
            cy="0"
            r="1.8"
            fill="currentColor"
            opacity="0.55"
            style={{
              offsetPath: `path('${fanTrunk}')`,
              offsetRotate: "0deg",
              animation: "ride 9s linear infinite",
            }}
          />
          {fanBranches.map((b, i) =>
            clusterSlots.map((j) => (
              <ClusterDoc
                key={`${b.end[1]}-${j}`}
                x={b.end[0] + 26 + 36 * j}
                y={b.end[1]}
                faded
                float={clusterFloat[(i + j) % clusterFloat.length]}
              />
            )),
          )}
          {journeyBranchIndexes.map((branchIdx, i) => {
            const b = fanBranches[branchIdx];
            const branchCurve = b.d.slice(b.d.indexOf("C"));
            return (
              <g
                key={branchIdx}
                style={{
                  offsetPath: `path('${fanTrunk} ${branchCurve} L ${b.end[0] + 26} ${b.end[1]}')`,
                  offsetRotate: "0deg",
                  animation: `journey 13s linear ${(i * 4.3).toFixed(2)}s infinite backwards`,
                }}
              >
                <ClusterDoc faded={false} />
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
