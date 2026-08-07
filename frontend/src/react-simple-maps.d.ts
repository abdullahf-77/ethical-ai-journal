// react-simple-maps@3.0.0 ships no types of its own, and the DefinitelyTyped
// @types package produced confusing, seemingly-stale errors in CI (a
// `domainId` prop that doesn't exist anywhere in this codebase or in
// react-simple-maps' actual v3 API). A small local declaration for exactly
// the exports RegionMap.tsx uses is more reliable than chasing a mismatched
// external types package.
declare module "react-simple-maps" {
  import type { CSSProperties, ReactNode, SVGProps } from "react";

  export interface ComposableMapProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
    projection?: string;
    projectionConfig?: { center?: [number, number]; scale?: number; rotate?: [number, number, number] };
    className?: string;
    children?: ReactNode;
  }
  export function ComposableMap(props: ComposableMapProps): JSX.Element;

  export interface GeographyFeature {
    rsmKey: string;
    id: string | number;
    geometry: unknown;
    properties: Record<string, unknown>;
  }

  export interface GeographiesProps {
    geography: unknown;
    children: (args: { geographies: GeographyFeature[] }) => ReactNode;
  }
  export function Geographies(props: GeographiesProps): JSX.Element;

  export interface GeographyProps extends Omit<SVGProps<SVGPathElement>, "style"> {
    geography: GeographyFeature;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
  }
  export function Geography(props: GeographyProps): JSX.Element;

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }
  export function Marker(props: MarkerProps): JSX.Element;
}
