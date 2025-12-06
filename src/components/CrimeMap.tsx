"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CrimeMapProps {
  geoJsonData: any;
  onRegionClick: (region: any) => void;
  selectedRegion: any;
}

// Fix for default marker icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

const Legend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `
        <div style="background: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-family: system-ui, sans-serif;">
          <div style="font-weight: 600; font-size: 12px; color: #334155; margin-bottom: 8px;">Tingkat Kriminalitas</div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 16px; height: 16px; background: #ef4444; border-radius: 4px; display: inline-block;"></span>
              <span style="font-size: 11px; color: #64748b;">Tinggi</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 16px; height: 16px; background: #f59e0b; border-radius: 4px; display: inline-block;"></span>
              <span style="font-size: 11px; color: #64748b;">Sedang</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 16px; height: 16px; background: #22c55e; border-radius: 4px; display: inline-block;"></span>
              <span style="font-size: 11px; color: #64748b;">Rendah</span>
            </div>
          </div>
        </div>
      `;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

const CrimeMap: React.FC<CrimeMapProps> = ({
  geoJsonData,
  onRegionClick,
  selectedRegion,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const geoJsonRef = useRef<any>(null);

  // Wait for component to mount before rendering map
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const style = (feature: any) => {
    const isSelected = selectedRegion?.properties?.id === feature.properties.id;
    const isHovered = hoveredRegion?.properties?.id === feature.properties.id;

    return {
      fillColor: feature.properties.color,
      weight: isSelected ? 3 : isHovered ? 2 : 1,
      opacity: 1,
      color: isSelected ? "#1e293b" : isHovered ? "#475569" : "#94a3b8",
      fillOpacity: isSelected ? 0.8 : isHovered ? 0.7 : 0.5,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      click: (e: any) => {
        L.DomEvent.stopPropagation(e);
        onRegionClick(feature);
      },
      mouseover: (e: any) => {
        setHoveredRegion(feature);
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: "#475569",
          fillOpacity: 0.7,
        });

        // Show tooltip
        layer
          .bindTooltip(
            `<div style="padding: 8px 12px; font-family: system-ui, sans-serif;">
            <div style="font-weight: 600; font-size: 13px; color: #1e293b;">${feature.properties.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Kasus: ${feature.properties.crimeCount}</div>
            <div style="font-size: 11px; color: ${feature.properties.color}; margin-top: 2px;">Tingkat: ${feature.properties.crimeRate}</div>
          </div>`,
            { sticky: true, className: "custom-tooltip" }
          )
          .openTooltip();
      },
      mouseout: (e: any) => {
        setHoveredRegion(null);
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
        layer.closeTooltip();
      },
    });
  };

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Memuat peta...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={[-2.929941, 122.073775]}
        zoom={11}
        className="w-full h-full"
        zoomControl={true}
        style={{ background: "#e2e8f0" }}
        key="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          ref={geoJsonRef}
          data={geoJsonData}
          style={style}
          onEachFeature={onEachFeature}
          key={`geojson-${selectedRegion?.properties?.id || "default"}`}
        />
        <Legend />
      </MapContainer>
    </div>
  );
};

export default CrimeMap;
