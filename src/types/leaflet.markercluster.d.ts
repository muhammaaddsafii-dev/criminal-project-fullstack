// src/types/leaflet.markercluster.d.ts
import * as L from 'leaflet';

declare module 'leaflet.markercluster' {
  export interface MarkerClusterGroupOptions {
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    disableClusteringAtZoom?: number;
    maxClusterRadius?: number;
    spiderLegPolylineOptions?: L.PolylineOptions;
    iconCreateFunction?: (cluster: any) => L.DivIcon;
  }

  export class MarkerClusterGroup extends L.FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    clearLayers(): this;
  }

  export function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}

declare module 'leaflet' {
  export interface MarkerCluster extends Marker {
    getChildCount(): number;
  }
}