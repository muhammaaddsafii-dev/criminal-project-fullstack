//src/components/CrimeMap.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  LayersControl,
} from "react-leaflet";
import * as L from "leaflet";
import type { GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";

// Import marker clustering
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { MarkerClusterGroup } from "leaflet.markercluster";

interface CrimeMapProps {
  onRegionClick: (region: any) => void;
  selectedRegion: any;
}

interface MapData {
  areas: GeoJsonObject;
  crime_reports: any[];
  security_posts: any[];
  cctvs: any[];
  summary?: {
    total_areas: number;
    total_crime_reports: number;
    total_security_posts: number;
    total_cctvs: number;
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

// Custom icons
const crimeIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div style="
      width: 30px;
      height: 30px;
      background-color: #dc2626;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const securityIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div style="
      width: 30px;
      height: 30px;
      background-color: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const cctvIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div style="
      width: 30px;
      height: 30px;
      background-color: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const Legend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `
        <div style="background: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-family: system-ui, sans-serif; min-width: 180px;">
          <div style="font-weight: 600; font-size: 12px; color: #334155; margin-bottom: 8px;">Tingkat Kriminalitas</div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #dc2626; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
              <span style="font-size: 11px; color: #dc2626;">Tinggi</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #EAB308; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
              <span style="font-size: 11px; color: #EAB308;">Sedang</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #10B981; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
              <span style="font-size: 11px; color: #10B981;">Rendah</span>
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

// Komponen untuk Crime Markers dengan clustering - DIBUAT CONTROLLED
const CrimeMarkersLayer = ({ crimes, isVisible }: { crimes: any[], isVisible: boolean }) => {
  const map = useMap();
  const clusterRef = useRef<MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Bersihkan cluster yang ada
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
      clusterRef.current.clearLayers();
      clusterRef.current = null;
    }

    // Jika tidak visible atau tidak ada data, jangan tambahkan
    if (!isVisible || crimes.length === 0) return;

    // Buat cluster baru
    clusterRef.current = new MarkerClusterGroup({
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            width: 40px; height: 40px;
            background-color: #dc2626;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">${count}</div>`,
          className: "custom-cluster-icon",
          iconSize: L.point(40, 40, true),
        });
      },
    });

    crimes.forEach((crime) => {
      if (crime.latitude && crime.longitude) {
        const marker = L.marker([crime.latitude, crime.longitude], {
          icon: crimeIcon,
        });

        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui;">
            <div style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 8px;">
              ${crime.name}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              <strong>Jenis:</strong> ${crime.jenis || '-'}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              <strong>Alamat:</strong> ${crime.address}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              <strong>Tanggal:</strong> ${new Date(crime.date).toLocaleDateString('id-ID')}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              <strong>Status:</strong> 
              <span style="
                padding: 2px 8px;
                border-radius: 4px;
                background: ${crime.status === 'Selesai' ? '#dcfce7' : '#fef3c7'};
                color: ${crime.status === 'Selesai' ? '#15803d' : '#a16207'};
                font-size: 11px;
              ">
                ${crime.status}
              </span>
            </div>
            ${crime.description ? `
              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                ${crime.description.substring(0, 100)}${crime.description.length > 100 ? '...' : ''}
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        clusterRef.current?.addLayer(marker);
      }
    });

    map.addLayer(clusterRef.current);

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current.clearLayers();
      }
    };
  }, [map, crimes, isVisible]);

  return null;
};

// Komponen untuk Security Post Markers - DIBUAT CONTROLLED
const SecurityPostMarkersLayer = ({ posts, isVisible }: { posts: any[], isVisible: boolean }) => {
  const map = useMap();
  const clusterRef = useRef<MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
      clusterRef.current.clearLayers();
      clusterRef.current = null;
    }

    if (!isVisible || posts.length === 0) return;

    clusterRef.current = new MarkerClusterGroup({
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            width: 40px; height: 40px;
            background-color: #10b981;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">${count}</div>`,
          className: "custom-cluster-icon",
          iconSize: L.point(40, 40, true),
        });
      },
    });

    posts.forEach((post) => {
      if (post.latitude && post.longitude) {
        const marker = L.marker([post.latitude, post.longitude], {
          icon: securityIcon,
        });

        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui;">
            <div style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 8px;">
              ${post.name}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              <strong>Lokasi:</strong> ${post.desa}, ${post.kecamatan}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              <strong>Alamat:</strong> ${post.address}
            </div>
            ${post.description ? `
              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                ${post.description}
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        clusterRef.current?.addLayer(marker);
      }
    });

    map.addLayer(clusterRef.current);

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current.clearLayers();
      }
    };
  }, [map, posts, isVisible]);

  return null;
};

// Komponen untuk CCTV Markers - DIBUAT CONTROLLED
const CCTVMarkersLayer = ({ cctvs, isVisible }: { cctvs: any[], isVisible: boolean }) => {
  const map = useMap();
  const clusterRef = useRef<MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
      clusterRef.current.clearLayers();
      clusterRef.current = null;
    }

    if (!isVisible || cctvs.length === 0) return;

    clusterRef.current = new MarkerClusterGroup({
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            width: 40px; height: 40px;
            background-color: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">${count}</div>`,
          className: "custom-cluster-icon",
          iconSize: L.point(40, 40, true),
        });
      },
    });

    cctvs.forEach((cctv) => {
      if (cctv.latitude && cctv.longitude) {
        const marker = L.marker([cctv.latitude, cctv.longitude], {
          icon: cctvIcon,
        });

        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui;">
            <div style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 8px;">
              ${cctv.name}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
              <strong>Lokasi:</strong> ${cctv.desa}, ${cctv.kecamatan}
            </div>
            ${cctv.description ? `
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                ${cctv.description}
              </div>
            ` : ''}
            ${cctv.url_cctv ? `
              <div style="margin-top: 8px;">
                <a href="${cctv.url_cctv}" target="_blank" style="
                  display: inline-block;
                  padding: 4px 12px;
                  background: #3b82f6;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  font-size: 11px;
                ">
                  Lihat Stream
                </a>
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        clusterRef.current?.addLayer(marker);
      }
    });

    map.addLayer(clusterRef.current);

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current.clearLayers();
      }
    };
  }, [map, cctvs, isVisible]);

  return null;
};

const CrimeMap: React.FC<CrimeMapProps> = ({
  onRegionClick,
  selectedRegion,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const geoJsonRef = useRef<any>(null);

  // State untuk mengontrol visibility layer
  const [showCrimes, setShowCrimes] = useState(true);
  const [showSecurity, setShowSecurity] = useState(true);
  const [showCCTV, setShowCCTV] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const fetchMapData = async () => {
        try {
          // Ganti URL sesuai dengan backend Django Anda
          const response = await fetch('http://localhost:8000/api/map/data/');
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setMapData(result.data);
            }
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching map data:", error);
          setLoading(false);
        }
      };

      fetchMapData();
    }
  }, [isMounted]);

  const style = (feature: any) => {
    const isSelected = selectedRegion?.id === feature.id;
    const isHovered = hoveredRegion?.id === feature.id;

    return {
      fillColor: feature.properties.color,
      weight: isSelected ? 3 : isHovered ? 2 : 1,
      opacity: 1,
      color: isSelected ? "#1e293b" : isHovered ? "#475569" : "#94a3b8",
      fillOpacity: isSelected ? 0.6 : isHovered ? 0.5 : 0.3,
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
          fillOpacity: 0.5,
        });

        layer
          .bindTooltip(
            `<div style="padding: 8px 12px; font-family: system-ui, sans-serif;">
              <div style="font-weight: 600; font-size: 13px; color: #1e293b;">${feature.properties.name}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                ${feature.properties.kecamatan}, ${feature.properties.desa}
              </div>
              ${feature.properties.luas ? `
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                  Luas: ${feature.properties.luas.toFixed(2)} km²
                </div>
              ` : ''}
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
      <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
        <p className="text-slate-500">Memuat peta...</p>
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
      >
        {/* Base Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* GeoJSON Layer untuk areas - selalu ditampilkan */}
        {mapData?.areas && (
          <GeoJSON
            ref={geoJsonRef}
            data={mapData.areas}
            style={style}
            onEachFeature={onEachFeature}
            key={`geojson-${selectedRegion?.id || "default"}`}
          />
        )}

        {/* Controlled Marker Layers */}
        {mapData?.crime_reports && (
          <CrimeMarkersLayer crimes={mapData.crime_reports} isVisible={showCrimes} />
        )}
        
        {mapData?.security_posts && (
          <SecurityPostMarkersLayer posts={mapData.security_posts} isVisible={showSecurity} />
        )}
        
        {mapData?.cctvs && (
          <CCTVMarkersLayer cctvs={mapData.cctvs} isVisible={showCCTV} />
        )}

        <Legend />
      </MapContainer>

      {/* Layer Control Manual */}
      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg z-[1] p-3">
        <div className="text-xs font-semibold text-slate-700 mb-2">Layer Peta</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCrimes}
              onChange={(e) => setShowCrimes(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
            />
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <span className="w-3 h-3 bg-red-600 rounded-full inline-block"></span>
              Laporan Kejahatan
            </span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSecurity}
              onChange={(e) => setShowSecurity(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <span className="w-3 h-3 bg-green-600 rounded-full inline-block"></span>
              Pos Keamanan
            </span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCCTV}
              onChange={(e) => setShowCCTV(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-600 rounded-full inline-block"></span>
              CCTV
            </span>
          </label>
        </div>
      </div>

      {loading && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm z-[1000]">
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-600"></span>
            Memuat data peta...
          </p>
        </div>
      )}

      {/* {mapData && mapData.summary && (
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm z-[1000]">
          <p className="text-xs text-slate-600 font-medium mb-1">
            📊 Statistik Data
          </p>
          <div className="text-[10px] text-slate-500 space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              {mapData.summary.total_crime_reports || 0} Laporan
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              {mapData.summary.total_security_posts || 0} Pos
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              {mapData.summary.total_cctvs || 0} CCTV
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default CrimeMap;