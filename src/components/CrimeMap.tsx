"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  useMap,
  LayersControl,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import marker clustering
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Import MarkerClusterGroup class
import { MarkerClusterGroup } from "leaflet.markercluster";

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
    coordinates: [number, number];
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
  const colorMap: Record<string, string> = {
    CRITICAL: "#dc2626",
    HIGH: "#ea580c",
    MEDIUM: "#f59e0b",
    LOW: "#16a34a",
  };

  const color = colorMap[severity] || "#6b7280";

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
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
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
                <div style="width: 12px; height: 12px; background: #ea580c; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
                <span style="font-size: 11px; color: #64748b;">Tinggi</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
                <span style="font-size: 11px; color: #64748b;">Sedang</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #16a34a; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
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

// Komponen untuk marker clustering
const CrimeMarkerCluster = ({ incidents }: { incidents: CrimeIncident[] }) => {
  const map = useMap();
  const clusterRef = useRef<MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map || incidents.length === 0) return;

    // Inisialisasi marker cluster group dengan konfigurasi
    clusterRef.current = new MarkerClusterGroup({
      // Options dari dokumentasi
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: false,
      disableClusteringAtZoom: 16,
      maxClusterRadius: 80,
      spiderLegPolylineOptions: {
        weight: 1.5,
        color: "#222",
        opacity: 0.5,
      },
      iconCreateFunction: function (cluster: any) {
        const childCount = cluster.getChildCount();
        let size = "small";
        let color = "#3b82f6"; // blue-500

        if (childCount < 10) {
          size = "small";
          color = "#3b82f6";
        } else if (childCount < 100) {
          size = "medium";
          color = "#1d4ed8"; // blue-700
        } else {
          size = "large";
          color = "#1e40af"; // blue-800
        }

        const sizes: Record<string, number> = {
          small: 40,
          medium: 50,
          large: 60,
        };

        return L.divIcon({
          html: `<div style="
            width: ${sizes[size]}px;
            height: ${sizes[size]}px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${
              size === "small" ? "14px" : size === "medium" ? "16px" : "18px"
            };
          ">
            ${childCount}
          </div>`,
          className: "custom-cluster-icon",
          iconSize: L.point(sizes[size], sizes[size], true),
        });
      },
    });

    // Tambahkan markers ke cluster group
    incidents.forEach((incident) => {
      const coordinates = incident.location?.coordinates;
      if (!coordinates || coordinates.length !== 2) return;

      const position: [number, number] = [coordinates[1], coordinates[0]];

      const marker = L.marker(position, {
        icon: getSeverityIcon(incident.severity_level),
      });

      // Format date and time
      const formatDateTime = (date: string, time: string) => {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        if (!time) return formattedDate;

        return `${formattedDate}, ${time.substring(0, 5)}`;
      };

      // Tambahkan popup
      const popupContent = `
        <div style="padding: 8px 12px; max-width: 280px; font-family: system-ui, sans-serif;">
          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 600; border-radius: 12px; background-color: #f1f5f9; color: #475569;">
              ${incident.incident_code}
            </span>
          </div>
          <h3 style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 6px;">
            ${incident.type_name}
          </h3>
          <div style="margin-bottom: 8px;">
            <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
              ${
                incident.severity_level === "CRITICAL"
                  ? "background-color: #fee2e2; color: #dc2626;"
                  : incident.severity_level === "HIGH"
                  ? "background-color: #ffedd5; color: #ea580c;"
                  : incident.severity_level === "MEDIUM"
                  ? "background-color: #fef3c7; color: #d97706;"
                  : "background-color: #dcfce7; color: #16a34a;"
              }
            ">
              Tingkat: ${incident.severity_level}
            </span>
          </div>
          <div style="font-size: 12px; color: #475569;">
            <p style="margin: 4px 0;">
              <span style="font-weight: 500;">Tanggal:</span> 
              ${formatDateTime(incident.incident_date, incident.incident_time)}
            </p>
            <p style="margin: 4px 0;">
              <span style="font-weight: 500;">Lokasi:</span> ${
                incident.area_name
              }
            </p>
            ${
              incident.address
                ? `
              <p style="margin: 4px 0;">
                <span style="font-weight: 500;">Alamat:</span> ${incident.address}
              </p>
            `
                : ""
            }
            ${
              incident.description
                ? `
              <p style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #64748b;">
                ${incident.description}
              </p>
            `
                : ""
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      clusterRef.current!.addLayer(marker);
    });

    // Tambahkan cluster group ke map
    map.addLayer(clusterRef.current);

    // Cleanup
    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current.clearLayers();
      }
    };
  }, [map, incidents]);

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const fetchIncidents = async () => {
        try {
          // Simulasi data untuk demo
          // const mockIncidents: CrimeIncident[] = [
          //   {
          //     id: 1,
          //     incident_code: "CR-001",
          //     area_id: 1,
          //     location: {
          //       type: "Point",
          //       coordinates: [122.073775, -2.929941]
          //     },
          //     address: "Jl. Trans Sulawesi KM 10",
          //     incident_date: "2024-01-15",
          //     incident_time: "14:30:00",
          //     severity_level: "HIGH",
          //     description: "Pencurian dengan kekerasan",
          //     type_name: "Pencurian",
          //     area_name: "Morowali Utara"
          //   },
          //   // Tambahkan lebih banyak data untuk demonstrasi clustering
          //   ...Array.from({ length: 100 }, (_, i) => ({
          //     id: i + 2,
          //     incident_code: `CR-${(i + 2).toString().padStart(3, '0')}`,
          //     area_id: Math.floor(Math.random() * 5) + 1,
          //     location: {
          //       type: "Point",
          //       coordinates: [
          //         122.073775 + (Math.random() - 0.5) * 0.2,
          //         -2.929941 + (Math.random() - 0.5) * 0.2
          //       ]
          //     },
          //     address: `Jl. Contoh ${i + 1}`,
          //     incident_date: "2024-01-15",
          //     incident_time: "14:30:00",
          //     severity_level: ["LOW", "MEDIUM", "HIGH", "CRITICAL"][Math.floor(Math.random() * 4)],
          //     description: "Kasus kriminalitas",
          //     type_name: ["Pencurian", "Perampokan", "Penganiayaan", "Narkoba"][Math.floor(Math.random() * 4)],
          //     area_name: ["Morowali Utara", "Morowali", "Bungku", "Bahodopi", "Wita Ponda"][Math.floor(Math.random() * 5)]
          //   }))
          // ];

          // setIncidents(mockIncidents);
          // setLoadingIncidents(false);

          // Untuk API nyata, gunakan kode berikut:
          const response = await fetch("/api/incidents");
          if (response.ok) {
            const data = await response.json();
            setIncidents(data);
            setLoadingIncidents(false);
          }
        } catch (error) {
          console.error("Error fetching incidents:", error);
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
          <LayersControl.BaseLayer checked name="Peta Jalan">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              detectRetina={true}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Humanitarian">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              maxZoom={19}
              detectRetina={true}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satelit">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              detectRetina={true}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* GeoJSON Layer untuk area */}
        <GeoJSON
          ref={geoJsonRef}
          data={geoJsonData}
          style={style}
          onEachFeature={onEachFeature}
          key={`geojson-${selectedRegion?.properties?.id || "default"}`}
        />

        {/* Marker Cluster Group */}
        <CrimeMarkerCluster incidents={incidents} />

        <Legend />
      </MapContainer>

      {loadingIncidents && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-600"></span>
            Memuat data insiden...
          </p>
        </div>
      )}

      {/* Info tentang clustering */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
        <p className="text-xs text-slate-600 font-medium">
          🗺️ Marker Clustering Aktif
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Klik cluster untuk zoom, marker untuk detail
        </p>
      </div>

      {/* Cluster controls info */}
      <div className="absolute bottom-16 left-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm">
        <p className="text-xs text-slate-600 font-medium mb-1">
          Kontrol Cluster:
        </p>
        <ul className="text-[10px] text-slate-500 space-y-0.5">
          <li>• Klik cluster: Zoom ke area</li>
          <li>• Zoom in: Pisah cluster</li>
          <li>• Hover cluster: Lihat coverage</li>
          <li>• Klik marker: Detail insiden</li>
        </ul>
      </div>
    </div>
  );
};

export default CrimeMap;
