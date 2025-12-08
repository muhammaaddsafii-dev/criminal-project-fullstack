"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  MapContainer, 
  TileLayer, 
  GeoJSON, 
  Marker, 
  Popup, 
  useMap,
  LayersControl
} from "react-leaflet";
// import L from "leaflet";
import * as L from "leaflet";

import "leaflet/dist/leaflet.css";

interface CrimeMapProps {
  geoJsonData: any;
  onRegionClick: (region: any) => void;
  selectedRegion: any;
}

interface CrimeIncident {
  id: number;
  incident_code: string;
  area_id: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  incident_date: string;
  incident_time: string;
  severity_level: string;
  description: string;
  type_name: string;
  area_name: string;
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

// Custom icon based on severity
const getSeverityIcon = (severity: string) => {
  const iconSize: [number, number] = [25, 41];
  const iconAnchor: [number, number] = [12, 41];
  const popupAnchor: [number, number] = [1, -34];

  const colorMap: Record<string, string> = {
    CRITICAL: "#dc2626", // red-600
    HIGH: "#ea580c", // orange-600
    MEDIUM: "#f59e0b", // amber-500
    LOW: "#16a34a", // green-600
  };

  const color = colorMap[severity] || "#6b7280"; // gray-500

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">
        ${severity.charAt(0)}
      </div>
    `,
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor,
  });
};

const Legend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `
        <div style="background: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-family: system-ui, sans-serif; min-width: 160px;">
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
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
            <div style="font-weight: 600; font-size: 12px; color: #334155; margin-bottom: 8px;">Insiden Kriminal</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #dc2626; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
                <span style="font-size: 11px; color: #64748b;">Kritis</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #ea580c; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
                <span style="font-size: 11px; color: #64748b;">Tinggi</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
                <span style="font-size: 11px; color: #64748b;">Sedang</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #16a34a; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
                <span style="font-size: 11px; color: #64748b;">Rendah</span>
              </div>
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
  const [incidents, setIncidents] = useState<CrimeIncident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const geoJsonRef = useRef<any>(null);

  // Wait for component to mount before rendering map
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch crime incidents
  useEffect(() => {
    if (isMounted) {
      const fetchIncidents = async () => {
        try {
          const response = await fetch('/api/incidents');
          if (response.ok) {
            const data = await response.json();
            setIncidents(data);
          }
        } catch (error) {
          console.error('Error fetching incidents:', error);
        } finally {
          setLoadingIncidents(false);
        }
      };

      fetchIncidents();
    }
  }, [isMounted]);

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

  // Format date and time for display
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    if (!time) return formattedDate;
    
    return `${formattedDate}, ${time.substring(0, 5)}`;
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
        <LayersControl position="topleft">
          {/* Base Layer 1: OpenStreetMap Standard */}
          <LayersControl.BaseLayer checked name="Peta Jalan">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              detectRetina={true}
            />
          </LayersControl.BaseLayer>

          {/* Base Layer 2: OpenStreetMap Humanitarian */}
          <LayersControl.BaseLayer name="Humanitarian">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              maxZoom={19}
              detectRetina={true}
            />
          </LayersControl.BaseLayer>

          {/* Base Layer 3: Satellite - Esri World Imagery */}
          <LayersControl.BaseLayer name="Satelit">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              detectRetina={true}
            />
          </LayersControl.BaseLayer>

          {/* Base Layer 4: Topographic Map */}
          <LayersControl.BaseLayer name="Topografi">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              detectRetina={true}
            />
          </LayersControl.BaseLayer>

          {/* Base Layer 5: Dark Mode */}
          <LayersControl.BaseLayer name="Mode Gelap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
              detectRetina={true}
            />
          </LayersControl.BaseLayer>

          {/* GeoJSON Layer untuk area */}
          <GeoJSON
            ref={geoJsonRef}
            data={geoJsonData}
            style={style}
            onEachFeature={onEachFeature}
            key={`geojson-${selectedRegion?.properties?.id || "default"}`}
          />
          
          {/* Render crime incident markers */}
          {incidents.map((incident) => {
            // Note: GeoJSON coordinates are [longitude, latitude]
            // Leaflet expects [latitude, longitude]
            const coordinates = incident.location?.coordinates;
            if (!coordinates || coordinates.length !== 2) return null;
            
            const position: [number, number] = [coordinates[1], coordinates[0]];
            
            return (
              <Marker
                key={incident.id}
                position={position}
                icon={getSeverityIcon(incident.severity_level)}
              >
                <Popup>
                  <div className="p-2 max-w-xs">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                        {incident.incident_code}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 mb-1">
                      {incident.type_name}
                    </h3>
                    <div className="mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        incident.severity_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        incident.severity_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        incident.severity_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        Tingkat: {incident.severity_level}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>
                        <span className="font-medium">Tanggal:</span>{' '}
                        {formatDateTime(incident.incident_date, incident.incident_time)}
                      </p>
                      <p>
                        <span className="font-medium">Lokasi:</span>{' '}
                        {incident.area_name}
                      </p>
                      {incident.address && (
                        <p>
                          <span className="font-medium">Alamat:</span>{' '}
                          <span className="text-slate-700">{incident.address}</span>
                        </p>
                      )}
                      {incident.description && (
                        <p className="mt-2 text-slate-700">
                          {incident.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </LayersControl>
        
        <Legend />
      </MapContainer>
      
      {loadingIncidents && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
          <p className="text-xs text-slate-600">
            Memuat data insiden...
          </p>
        </div>
      )}
      
      {/* Layer switcher info */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
        <p className="text-xs text-slate-600 font-medium">
          Pilih jenis peta
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Klik ikon lapisan di kiri atas
        </p>
      </div>
    </div>
  );
};

export default CrimeMap;