"use client";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CrimeMapProps {
  stats: {
    totalCases: number;
    solvedCases: number;
    pendingCases: number;
    clearanceRate: number;
    districtData: { name: string; total: number }[];
    topCrimeTypes: { type: string; count: number; percentage: number }[];
    hotspots: { area: string; cases: number; trend: string }[];
    recentIncidents: any[];
  };
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
    const legend = new (L.Control.extend({
      options: { position: "bottomright" },
      onAdd: function () {
        const div = L.DomUtil.create("div", "legend");
        div.innerHTML = `
          <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Tingkat Kriminalitas</h4>
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="width: 20px; height: 20px; background: #ef4444; display: inline-block; margin-right: 8px; border-radius: 3px;"></span>
              <span style="font-size: 12px;">Tinggi</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="width: 20px; height: 20px; background: #f59e0b; display: inline-block; margin-right: 8px; border-radius: 3px;"></span>
              <span style="font-size: 12px;">Sedang</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="width: 20px; height: 20px; background: #22c55e; display: inline-block; margin-right: 8px; border-radius: 3px;"></span>
              <span style="font-size: 12px;">Rendah</span>
            </div>
          </div>
        `;
        return div;
      },
    }))();

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

const CrimeMap: React.FC<CrimeMapProps> = ({ stats }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const style = (feature: any) => {
    return {
      fillColor: feature.properties.color,
      weight: 2,
      opacity: 1,
      color: "white",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const { name, crimeCount, crimeRate } = feature.properties;
    layer.bindPopup(`
      <div style="font-family: sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${name}</h3>
        <p style="margin: 4px 0;"><strong>Jumlah Kasus:</strong> ${crimeCount}</p>
        <p style="margin: 4px 0;"><strong>Tingkat:</strong> ${crimeRate}</p>
      </div>
    `);

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          fillOpacity: 0.9,
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle({
          fillOpacity: 0.7,
        });
      },
    });
  };

  if (!isMounted) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[-6.2088, 106.8456]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={require("@/data/mockData").geoJsonData as any}
          style={style}
          onEachFeature={onEachFeature}
        />
        <Legend />
      </MapContainer>
    </div>
  );
};

export default CrimeMap;
