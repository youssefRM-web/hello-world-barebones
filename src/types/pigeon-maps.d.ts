declare module 'pigeon-maps' {
  import { FC, ReactNode } from 'react';

  export interface MapProps {
    center?: [number, number];
    zoom?: number;
    width?: number;
    height?: number;
    defaultCenter?: [number, number];
    defaultZoom?: number;
    minZoom?: number;
    maxZoom?: number;
    attribution?: boolean | ReactNode;
    onClick?: (event: { event: MouseEvent; latLng: [number, number]; pixel: [number, number] }) => void;
    onBoundsChanged?: (params: { center: [number, number]; zoom: number; bounds: { ne: [number, number]; sw: [number, number] }; initial: boolean }) => void;
    children?: ReactNode;
  }

  export interface MarkerProps {
    anchor: [number, number];
    offset?: [number, number];
    width?: number;
    color?: string;
    hover?: boolean;
    payload?: any;
    onClick?: (payload: any) => void;
    children?: ReactNode;
  }

  export interface OverlayProps {
    anchor: [number, number];
    offset?: [number, number];
    children?: ReactNode;
  }

  export const Map: FC<MapProps>;
  export const Marker: FC<MarkerProps>;
  export const Overlay: FC<OverlayProps>;
}