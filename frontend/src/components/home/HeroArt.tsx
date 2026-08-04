// Decorative hero artwork ported from the Claude Design source: papers riding
// flow lines from the left, converging into the journal's "index" frame on the
// right. Desktop-only — hidden below lg to keep the responsive hero clean.

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

const indexPaths = [
  { d: "M 189 147.2 C 267.8 215.5, 319.5 200.5, 406 224.4", dash: "7.3 6.7", dur: 7.7 },
  { d: "M 219.9 196.5 C 299.8 177.1, 342.1 344.9, 406 303.7", dash: "8.9 7.5", dur: 5.4 },
  { d: "M 238.2 251.7 C 292.7 190.7, 366.3 367.0, 406 358.2", dash: "5.8 8.0", dur: 5.3 },
  { d: "M 242.6 314.6 C 325.8 332.6, 368.9 234.0, 406 220.6", dash: "7.6 9.3", dur: 8.6 },
  { d: "M 232.1 371.8 C 301.4 335.9, 368.8 358.9, 406 323.1", dash: "7.0 7.1", dur: 8.3 },
  { d: "M 205.9 429.1 C 284.9 434.9, 334.3 293.6, 406 276.1", dash: "7.6 8.8", dur: 7.9 },
  { d: "M 205.9 170.9 C 310.2 191.3, 326.8 272.8, 406 242.7", dash: "7.1 6.2", dur: 5.6 },
  { d: "M 219.9 403.5 C 289.7 412.8, 356.0 259.5, 406 265.9", dash: "9.0 6.6", dur: 8.2 },
];

const indexDocPositions = [174, 242, 310, 378].flatMap((y) =>
  [428, 484, 540].map((x) => ({ x, y })),
);

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

function IndexedDoc({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="34" height="44" rx="3.5" fill="var(--art-fill)" stroke="currentColor" strokeWidth="1.2" />
      <rect x="6" y="9" width="22" height="1.8" rx="0.9" fill="currentColor" opacity="0.6" />
      <rect x="6" y="16" width="16" height="1.8" rx="0.9" fill="currentColor" opacity="0.45" />
      <rect x="6" y="23" width="20" height="1.8" rx="0.9" fill="currentColor" opacity="0.45" />
      <rect x="6" y="30" width="13" height="1.8" rx="0.9" fill="currentColor" opacity="0.45" />
    </g>
  );
}

export function HeroArt() {
  return (
    <>
      <div
        aria-hidden="true"
        className="hero-art pointer-events-none absolute left-[calc(50%-720px)] top-1/2 hidden h-[600px] w-[720px] -translate-y-1/2 opacity-80 lg:block"
      >
        <svg viewBox="0 0 720 600" className="h-full w-full">
          {flowPaths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke="currentColor"
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
                animation: `ride ${c.dur}s linear ${(i * 0.47).toFixed(2)}s infinite`,
              }}
            />
          ))}
          {ridingDocs.map((doc, i) => (
            <g
              key={i}
              style={{
                offsetPath: `path('${flowPaths[i].d}')`,
                offsetRotate: "0deg",
                animation: `ride ${doc.dur}s linear ${(i * 0.66).toFixed(2)}s infinite`,
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
        className="hero-art pointer-events-none absolute left-1/2 top-1/2 hidden h-[600px] w-[720px] -translate-y-1/2 opacity-80 lg:block"
      >
        <svg viewBox="0 0 720 600" className="h-full w-full">
          {indexPaths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              opacity="0.4"
              strokeDasharray={p.dash}
              style={{ animation: `flow ${p.dur}s linear infinite` }}
            />
          ))}
          <rect
            x="406"
            y="148"
            width="200"
            height="304"
            rx="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            opacity="0.6"
            strokeDasharray="5 6"
          />
          {indexDocPositions.map((pos, i) => (
            <IndexedDoc key={i} x={pos.x} y={pos.y} />
          ))}
        </svg>
      </div>
    </>
  );
}
