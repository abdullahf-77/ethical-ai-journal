import { useId, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
// Bundled locally (world-atlas is a devDependency) so the map never makes a
// runtime request to a tile/geo server — same "static data, no network
// calls" rule the rest of the site's data follows.
import worldTopo from "world-atlas/countries-110m.json";
import type { Center, CenterGroup, CenterGroupId } from "../../types";

// Rough manual framing per region — world-atlas's bundled 110m topology
// keeps this cheap to render, but real geographic fit (especially for
// groups I and IV, which each span more than one continent) will likely
// want small scale/center tweaks once this is actually visible in a
// browser, which this environment couldn't run.
const PROJECTION_CONFIG: Record<CenterGroupId, { center: [number, number]; scale: number }> = {
  I: { center: [-25, 45], scale: 220 },
  II: { center: [35, 52], scale: 500 },
  III: { center: [-65, -15], scale: 220 },
  IV: { center: [110, 5], scale: 165 },
  Va: { center: [40, 24], scale: 500 },
  Vb: { center: [20, 2], scale: 340 },
};

interface RegionMapProps {
  group: CenterGroup;
  centers: Center[];
  selectedCenterId: string | null;
  onSelectCenter: (id: string) => void;
}

export function RegionMap({ group, centers, selectedCenterId, onSelectCenter }: RegionMapProps) {
  const uid = useId();
  const patternId = `no-center-stripes-${uid}`;
  // Compared as numbers, not strings: world-atlas's topojson `id` may be a
  // plain number (e.g. 40) rather than the zero-padded ISO string ("040")
  // our data files use, which would otherwise silently drop every country
  // coded under 100 (Austria, Belgium, Brazil, ...).
  const countriesWithCenters = useMemo(() => new Set(centers.map((c) => Number(c.countryCode))), [centers]);
  const groupCodes = useMemo(() => new Set(group.countryCodes.map(Number)), [group]);
  const projectionConfig = PROJECTION_CONFIG[group.id];

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-icaire-50/40 dark:border-zinc-800 dark:bg-zinc-900/40">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={projectionConfig}
        className="h-full w-full"
      >
        <defs>
          <pattern id={patternId} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#ecfdf3" className="dark:fill-zinc-800" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#6bb75e" strokeWidth="2.5" />
          </pattern>
        </defs>

        <Geographies geography={worldTopo}>
          {({ geographies }) =>
            geographies
              .filter((geo) => groupCodes.has(Number(geo.id)))
              .map((geo) => {
                const hasCenter = countriesWithCenters.has(Number(geo.id));
                return (
                  <Geography
                    key={geo.rsmKey}
                    geo={geo}
                    fill={hasCenter ? "#3f3f46" : `url(#${patternId})`}
                    stroke="#a1a1aa"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: hasCenter ? "#27272a" : `url(#${patternId})` },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
          }
        </Geographies>

        {centers.map((center) => (
          <Marker key={center.id} coordinates={[center.lng, center.lat]}>
            <g
              role="button"
              tabIndex={0}
              aria-label={center.name}
              onClick={() => onSelectCenter(center.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectCenter(center.id);
              }}
              className="cursor-pointer outline-none"
            >
              <circle r={selectedCenterId === center.id ? 7 : 5} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
              <circle r={selectedCenterId === center.id ? 7 : 5} fill="#dc2626" opacity={0.35}>
                <animate attributeName="r" values="5;11;5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
