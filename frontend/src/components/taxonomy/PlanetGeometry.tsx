// Per-domain planet iconography, ported verbatim from the Claude Design
// source. One shared sphere treatment (boundary ring, glow, veil — see
// PlanetOrb) and one stroke-weight range, one color (currentColor, set by
// the caller). Identity comes only from internal geometry: a dot is an
// actor/data point, a closed ring is a boundary, a line to center is
// traceability, mirrored curves are fairness, crossing paths are
// collaboration, expanding rings are awareness, an unbroken path is
// transparency, a seamless loop is sustainability, a dominant axis is
// oversight, nested layers are protection. Do not add per-domain color —
// the geometry alone carries the meaning.
import type { CSSProperties, ReactNode } from "react";

const C = 300;

const pol = (r: number, deg: number): [number, number] => [
  C + r * Math.cos((deg * Math.PI) / 180),
  C + r * Math.sin((deg * Math.PI) / 180),
];
const f1 = (n: number) => n.toFixed(1);

function arcPath(r: number, a0: number, a1: number): string {
  const [x0, y0] = pol(r, a0);
  const [x1, y1] = pol(r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${f1(x0)} ${f1(y0)} A ${r} ${r} 0 ${large} 1 ${f1(x1)} ${f1(y1)}`;
}

/** Smooth closed organic loop through N polar radii — no start or end point. */
function blob(rs: number[], rot: number): string {
  const n = rs.length;
  const pts = rs.map((r, i) => pol(r, (i / n) * 360 + rot));
  let d = `M ${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f1(c1[0])} ${f1(c1[1])}, ${f1(c2[0])} ${f1(c2[1])}, ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + " Z";
}

function Path({ d, sw, op, style }: { d: string; sw: number; op: number; style?: CSSProperties }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      opacity={op}
      style={style}
    />
  );
}
function Ring({ r, sw, op }: { r: number; sw: number; op: number }) {
  return <circle cx={C} cy={C} r={r} fill="none" stroke="currentColor" strokeWidth={sw} opacity={op} />;
}
function Dot({ r, deg, rad, op, style }: { r: number; deg: number; rad: number; op: number; style?: CSSProperties }) {
  const [x, y] = pol(r, deg);
  return <circle cx={f1(x)} cy={f1(y)} r={rad} fill="currentColor" opacity={op} style={style} />;
}
/** A rotating layer. Static tilt goes on the SVG transform attribute so it can
 * never fight the CSS rotation animation. */
function Layer({ dur, rev, tilt, children }: { dur: number; rev?: boolean; tilt?: number; children: ReactNode }) {
  return (
    <g transform={tilt ? `rotate(${tilt} ${C} ${C})` : undefined}>
      <g
        style={{
          transformOrigin: `${C}px ${C}px`,
          animation: `${rev ? "spin-rev" : "spin-slow"} ${dur}s linear infinite`,
        }}
      >
        {children}
      </g>
    </g>
  );
}

const GEOMETRY: Record<number, () => ReactNode[]> = {
  // Proportionality and Do No Harm — calm core, proportionally spaced bands.
  // "The use of AI systems must not go beyond what is necessary to achieve a
  // legitimate aim." Equal increments that grow, then stop short of the limit.
  1: () => [
    <Path key="limit" d={arcPath(240, 0, 359.9)} sw={2.2} op={0.28} style={{ strokeDasharray: "7 11" }} />,
    <Dot key="core" r={0} deg={0} rad={7} op={1} />,
    <Layer key="steps" dur={400}>
      {[70, 120, 170, 210].map((r, i) => (
        <Path key={"s" + i} d={arcPath(r, -125, -125 + 45 * (i + 1))} sw={4.2} op={1 - i * 0.16} />
      ))}
    </Layer>,
  ],
  // "Unwanted harms as well as vulnerabilities to attack should be avoided."
  // Three broken layers whose gaps never align — nothing outside has a straight
  // way in; the faint marks at the rim are approaches that stop there.
  2: () => [
    <Dot key="core" r={0} deg={0} rad={8} op={1} />,
    <Ring key="cr" r={26} sw={3} op={0.45} />,
    <Layer key="d1" dur={220}>
      {[0, 180].map((a, i) => (
        <Path key={"a" + i} d={arcPath(92, a + 9, a + 171)} sw={4.2} op={1} />
      ))}
    </Layer>,
    <Layer key="d2" dur={300} rev>
      {[90, 270].map((a, i) => (
        <Path key={"b" + i} d={arcPath(160, a + 9, a + 171)} sw={4.2} op={0.78} />
      ))}
    </Layer>,
    <Layer key="d3" dur={380}>
      {[45, 225].map((a, i) => (
        <Path key={"c" + i} d={arcPath(224, a + 9, a + 171)} sw={4} op={0.56} />
      ))}
    </Layer>,
    ...[20, 150, 268].map((a, i) => {
      const [x0, y0] = pol(258, a);
      const [x1, y1] = pol(234, a);
      return <Path key={"in" + i} d={`M ${f1(x0)} ${f1(y0)} L ${f1(x1)} ${f1(y1)}`} sw={3} op={0.35} />;
    }),
  ],
  // "Privacy must be protected throughout the AI lifecycle. Adequate data
  // protection frameworks." A data core sealed by two unbroken boundaries, an
  // empty buffer band, and traffic that only ever circulates outside them.
  3: () => [
    <Dot key="core" r={0} deg={0} rad={8} op={1} />,
    <Ring key="b1" r={62} sw={4.2} op={1} />,
    <Ring key="b2" r={106} sw={4.2} op={0.76} />,
    <Layer key="out" dur={240}>
      <Path key="p0" d={arcPath(214, -52, 52)} sw={3.2} op={0.5} style={{ strokeDasharray: "8 11" }} />
      <Path key="p1" d={arcPath(214, 128, 232)} sw={3.2} op={0.5} style={{ strokeDasharray: "8 11" }} />
    </Layer>,
  ],
  // Multi-stakeholder Governance — equal actors on a shared ring, linked to one
  // another rather than to any center.
  // "National sovereignty must be respected… participation of diverse
  // stakeholders is necessary." Equally spaced actors of differing size sharing
  // one frame, linked to each other rather than to any center.
  4: () => {
    const angles = [0, 60, 120, 180, 240, 300];
    return [
      <Layer key="mesh" dur={420}>
        <Path key="shared" d={arcPath(200, 0, 359.9)} sw={2.6} op={0.3} />
        {angles.slice(0, 3).map((a, i) => {
          const [x0, y0] = pol(200, a);
          const [x1, y1] = pol(200, a + 180);
          const [cx1, cy1] = pol(96, a + 90);
          return <Path key={"ch" + i} d={`M ${f1(x0)} ${f1(y0)} Q ${f1(cx1)} ${f1(cy1)} ${f1(x1)} ${f1(y1)}`} sw={3} op={0.42} />;
        })}
        {angles.map((a, i) => (
          <Dot
            key={"nd" + i}
            r={200}
            deg={a}
            rad={i % 2 ? 7.5 : 10}
            op={1}
            style={{ animation: `nodepulse ${17 + i * 2}s ease-in-out ${i * 1.6}s infinite` }}
          />
        ))}
      </Layer>,
    ];
  },
  // "AI systems should be auditable and traceable." Every outer actor leaves a
  // trail that flows inward to one answerable center.
  5: () => {
    const out = [-90, -18, 54, 126, 198];
    const items: ReactNode[] = [
      <Dot key="center" r={0} deg={0} rad={13} op={1} />,
      <Ring key="cring" r={34} sw={2.6} op={0.35} />,
    ];
    out.forEach((a, i) => {
      const [ex, ey] = pol(212, a);
      const [cx1, cy1] = pol(140, a + 30);
      const d = `M ${f1(ex)} ${f1(ey)} Q ${f1(cx1)} ${f1(cy1)} ${C} ${C}`;
      items.push(
        <Path
          key={"c" + i}
          d={d}
          sw={3.4}
          op={0.72}
          style={{ strokeDasharray: "9 12", animation: `flow ${26 + i * 3}s linear infinite` }}
        />,
      );
      items.push(<Dot key={"o" + i} r={212} deg={a} rad={7} op={1} />);
    });
    return items;
  },
  // "The ethical deployment of AI depends on transparency and explainability."
  // The emptiest planet: one unbroken path from the rim that you can follow all
  // the way to an exposed center.
  6: () => {
    const d = "M 62 232 C 158 148, 202 344, 300 300";
    return [
      <Path key="f1" d={arcPath(205, 196, 344)} sw={2.4} op={0.22} />,
      <Path key="f2" d={arcPath(132, 26, 154)} sw={2.4} op={0.2} />,
      <Path key="main" d={d} sw={4.6} op={1} />,
      <Dot key="end" r={0} deg={0} rad={7} op={1} />,
      <circle
        key="pulse"
        cx={0}
        cy={0}
        r={4}
        fill="currentColor"
        opacity={0.9}
        style={{ offsetPath: `path('${d}')`, offsetRotate: "0deg", animation: "ride 20s linear infinite backwards" }}
      />,
    ];
  },
  // "AI systems do not displace ultimate human responsibility." One fixed point
  // held above the system, connected down to its center; everything else turns.
  7: () => [
    <Layer key="s1" dur={300} tilt={20}>
      <ellipse cx={C} cy={C} rx={196} ry={232} fill="none" stroke="currentColor" strokeWidth={2.4} opacity={0.2} />
    </Layer>,
    <Layer key="s2" dur={380} rev tilt={-40}>
      <ellipse cx={C} cy={C} rx={232} ry={156} fill="none" stroke="currentColor" strokeWidth={2.4} opacity={0.2} />
    </Layer>,
    <circle key="oring" cx={C} cy={96} r={30} fill="none" stroke="currentColor" strokeWidth={3.4} opacity={1} />,
    <circle key="onode" cx={C} cy={96} r={12} fill="currentColor" opacity={1} />,
    <Path key="ctrlline" d="M 300 126 C 340 190, 260 240, 300 300" sw={4.6} op={0.9} />,
    <Dot key="ctrl" r={0} deg={0} rad={9} op={1} />,
  ],
  // Sustainability — one loop that flows without beginning or end, feeding the
  // loops nested inside it.
  // "A set of constantly evolving goals." One loop with no beginning or end,
  // flowing continuously, feeding the loops nested inside it.
  8: () => {
    const outer = blob([215, 150, 205, 165, 190, 145], 0);
    return [
      <Path key="o" d={outer} sw={4.2} op={0.95} style={{ strokeDasharray: "10 13", animation: "flow 26s linear infinite" }} />,
      <circle
        key="rider"
        cx={0}
        cy={0}
        r={5}
        fill="currentColor"
        opacity={1}
        style={{ offsetPath: `path('${outer}')`, offsetRotate: "0deg", animation: "orbit 48s linear infinite" }}
      />,
      <Layer key="l2" dur={380} rev>
        <Path
          key="p"
          d={blob([150, 195, 132, 186, 165, 114], 30)}
          sw={3}
          op={0.38}
          style={{ strokeDasharray: "9 12", animation: "flow 32s linear infinite" }}
        />
      </Layer>,
      <Layer key="l3" dur={220}>
        <Path key="p" d={blob([96, 66, 104, 76], 15)} sw={2.8} op={0.28} />
      </Layer>,
    ];
  },
  // "Public understanding of AI should be promoted through open and accessible
  // education." Understanding leaves one source and spreads outward, thinning.
  9: () => [
    <Dot key="src" r={0} deg={0} rad={8} op={1} />,
    <Ring key="r1" r={58} sw={4.2} op={0.95} />,
    <Ring key="r2" r={112} sw={3.6} op={0.64} />,
    <Ring key="r3" r={166} sw={3} op={0.4} />,
    <Ring key="r4" r={220} sw={2.6} op={0.22} />,
    ...[0, 4.7, 9.4].map((delay, i) => (
      <circle
        key={"w" + i}
        cx={C}
        cy={C}
        r={240}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        style={{ transformOrigin: `${C}px ${C}px`, animation: `wave 14s ease-out ${delay}s infinite backwards` }}
      />
    )),
  ],
  // "AI's benefits are accessible to all." The only planet symmetrical on both
  // axes — nothing weighs more on one side than the other.
  10: () => [
    <Path key="vax" d="M 300 46 L 300 554" sw={3} op={0.85} />,
    <Path key="hax" d="M 46 300 L 554 300" sw={2.4} op={0.32} />,
    <g key="sym" style={{ transformOrigin: `${C}px ${C}px`, animation: "sway 22s ease-in-out infinite" }}>
      <Path key="oL" d="M 300 58 C 118 152, 118 448, 300 542" sw={4} op={0.9} />
      <Path key="oR" d="M 300 58 C 482 152, 482 448, 300 542" sw={4} op={0.9} />
      <Dot key="nL" r={148} deg={180} rad={8} op={1} />
      <Dot key="nR" r={148} deg={0} rad={8} op={1} />
    </g>,
    <Dot key="mid" r={0} deg={0} rad={6} op={0.9} />,
  ],
};

export function PlanetGeometry({ domainId }: { domainId: number }) {
  const build = GEOMETRY[domainId];
  return (
    <>
      <Ring r={260} sw={4} op={0.9} />
      {build ? build() : null}
    </>
  );
}
