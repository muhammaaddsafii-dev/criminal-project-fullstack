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

// ========== TAMBAHAN: Interface untuk klasifikasi ==========
interface AreaClassification {
  id: number;
  name: string;
  total_cases: number;
  classification: 'RENDAH' | 'SEDANG' | 'TINGGI';
  color: string;
  level: number;
  desa_id: number;
}
// ===========================================================

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
              <div style="width: 16px; height: 16px; background: #ef4444; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
              <span style="font-size: 11px; color: #ef4444; font-weight: 500;">Tinggi</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #f59e0b; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
              <span style="font-size: 11px; color: #f59e0b; font-weight: 500;">Sedang</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #10b981; border-radius: 10%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
              <span style="font-size: 11px; color: #10b981; font-weight: 500;">Rendah</span>
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

// Komponen Custom Map Controls (Zoom + Layers)
const CustomMapControls = ({ 
  showCrimes, 
  setShowCrimes, 
  showSecurity, 
  setShowSecurity, 
  showCCTV, 
  setShowCCTV 
}: {
  showCrimes: boolean;
  setShowCrimes: (show: boolean) => void;
  showSecurity: boolean;
  setShowSecurity: (show: boolean) => void;
  showCCTV: boolean;
  setShowCCTV: (show: boolean) => void;
}) => {
  const map = useMap();
  const [isLayerOpen, setIsLayerOpen] = useState(false);

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return null; // Render via React portal di parent component
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
    const clusterGroup = new MarkerClusterGroup({
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
              <strong>Tanggal:</strong> ${crime.date ? new Date(crime.date).toLocaleDateString('id-ID') : '-'}
            </div>
            ${crime.status ? `
              <div style="margin-top: 8px;">
                <span style="padding: 4px 8px; background: ${crime.status.toLowerCase().includes('selesai') ? '#dcfce7' : '#fef3c7'}; color: ${crime.status.toLowerCase().includes('selesai') ? '#166534' : '#92400e'}; border-radius: 4px; font-size: 11px; font-weight: 600;">
                  ${crime.status}
                </span>
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        clusterGroup.addLayer(marker);
      }
    });


    // Assign ke ref setelah semua marker ditambahkan

    clusterRef.current = clusterGroup;

    map.addLayer(clusterGroup);

    return () => {
      if (clusterRef.current && map) {
        map.removeLayer(clusterRef.current);
        clusterRef.current.clearLayers();
        clusterRef.current = null;
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

    // Inject fullscreen gallery function to window
    if (typeof window !== 'undefined') {
      (window as any).openFullscreenGallery = (photos: string[], startIndex: number, title: string) => {
        let currentIndex = startIndex;

        const overlay = document.createElement('div');
        overlay.id = 'fullscreen-image-overlay';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 24px;
          cursor: pointer;
          z-index: 10001;
          transition: background 0.2s;
        `;
        closeBtn.onmouseenter = () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.3)'; };
        closeBtn.onmouseleave = () => { closeBtn.style.background = 'rgba(255, 255, 255, 0.2)'; };
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          document.body.removeChild(overlay);
        };

        const titleDiv = document.createElement('div');
        titleDiv.textContent = title;
        titleDiv.style.cssText = `
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 18px;
          font-weight: 600;
          z-index: 10001;
        `;

        const counterDiv = document.createElement('div');
        counterDiv.style.cssText = `
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          z-index: 10001;
        `;

        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        const img = document.createElement('img');
        img.style.cssText = `
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
        `;

        const updateImage = () => {
          img.src = photos[currentIndex];
          counterDiv.textContent = (currentIndex + 1) + ' / ' + photos.length;
        };

        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '‹';
        prevBtn.style.cssText = `
          position: absolute;
          left: -60px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 30px;
          cursor: pointer;
          z-index: 10001;
          display: ` + (photos.length > 1 ? 'flex' : 'none') + `;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        `;
        prevBtn.onmouseenter = () => { prevBtn.style.background = 'rgba(255, 255, 255, 0.3)'; };
        prevBtn.onmouseleave = () => { prevBtn.style.background = 'rgba(255, 255, 255, 0.2)'; };
        prevBtn.onclick = (e) => {
          e.stopPropagation();
          currentIndex = (currentIndex - 1 + photos.length) % photos.length;
          updateImage();
        };

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '›';
        nextBtn.style.cssText = `
          position: absolute;
          right: -60px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 30px;
          cursor: pointer;
          z-index: 10001;
          display: ` + (photos.length > 1 ? 'flex' : 'none') + `;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        `;
        nextBtn.onmouseenter = () => { nextBtn.style.background = 'rgba(255, 255, 255, 0.3)'; };
        nextBtn.onmouseleave = () => { nextBtn.style.background = 'rgba(255, 255, 255, 0.2)'; };
        nextBtn.onclick = (e) => {
          e.stopPropagation();
          currentIndex = (currentIndex + 1) % photos.length;
          updateImage();
        };

        const handleKeyboard = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleKeyboard);
          } else if (e.key === 'ArrowLeft' && photos.length > 1) {
            currentIndex = (currentIndex - 1 + photos.length) % photos.length;
            updateImage();
          } else if (e.key === 'ArrowRight' && photos.length > 1) {
            currentIndex = (currentIndex + 1) % photos.length;
            updateImage();
          }
        };
        document.addEventListener('keydown', handleKeyboard);

        overlay.onclick = () => {
          document.body.removeChild(overlay);
          document.removeEventListener('keydown', handleKeyboard);
        };

        imgContainer.onclick = (e) => { e.stopPropagation(); };

        imgContainer.appendChild(prevBtn);
        imgContainer.appendChild(img);
        imgContainer.appendChild(nextBtn);
        overlay.appendChild(closeBtn);
        overlay.appendChild(titleDiv);
        overlay.appendChild(imgContainer);
        overlay.appendChild(counterDiv);
        document.body.appendChild(overlay);

        updateImage();
      };
    }

    const clusterGroup = new MarkerClusterGroup({
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

        // API /map/data/ menggunakan field: name, address, description, photos (array of URLs)
        const hasPhotos = post.photos && Array.isArray(post.photos) && post.photos.length > 0;

        let photoHtml = '';
        if (hasPhotos) {
          const photoId = `photo-slider-${post.id}`;
          
          photoHtml = `
            <div style="margin-top: 8px;">
              <div id="${photoId}" style="position: relative; width: 100%; aspect-ratio: 16/9; background: #f1f5f9; border-radius: 8px; overflow: hidden;">
                <img 
                  id="${photoId}-img"
                  src="${post.photos[0]}" 
                  alt="Security Post Photo"
                  style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;"
                  onclick="openFullscreenGallery(${JSON.stringify(post.photos).replace(/"/g, '&quot;')}, parseInt(document.getElementById('${photoId}-img').dataset.index || '0'), '${post.name.replace(/'/g, "\\'")}')"
                  onerror="this.style.display='none'"
                  data-index="0"
                />
                ${post.photos.length > 1 ? `
                  <button 
                    id="${photoId}-prev"
                    style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; font-size: 20px; font-weight: bold; display: flex; align-items: center; justify-content: center;"
                  >‹</button>
                  <button 
                    id="${photoId}-next"
                    style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; font-size: 20px; font-weight: bold; display: flex; align-items: center; justify-content: center;"
                  >›</button>
                  <div 
                    id="${photoId}-counter"
                    style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px;"
                  >1 / ${post.photos.length}</div>
                ` : ''}
              </div>
              <div style="text-align: center; margin-top: 4px;">
                <small style="color: #64748b; font-size: 10px;">Click photo to view fullscreen</small>
              </div>
            </div>
          `;
        }

        const popupContent = `
          <div style="min-width: 220px; font-family: system-ui;">
            <div style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 8px;">
              🛡️ ${post.name}
            </div>
            ${post.address ? `
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                📍 ${post.address}
              </div>
            ` : ''}
            ${post.description ? `
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                ${post.description}
              </div>
            ` : ''}
            ${photoHtml}
          </div>
        `;

        const popup = L.popup({ maxWidth: 300 }).setContent(popupContent);
        marker.bindPopup(popup);

        // Add slider event listeners after popup opens
        if (hasPhotos && post.photos.length > 1) {
          marker.on('popupopen', () => {
            let currentIndex = 0;
            const photos = post.photos;
            const photoId = `photo-slider-${post.id}`;

            const updatePhoto = (newIndex: number) => {
              currentIndex = newIndex;
              const imgEl = document.getElementById(`${photoId}-img`) as HTMLImageElement;
              const counterEl = document.getElementById(`${photoId}-counter`);

              if (imgEl && photos[currentIndex]) {
                imgEl.src = photos[currentIndex];
                imgEl.dataset.index = currentIndex.toString();
              }
              if (counterEl) {
                counterEl.textContent = `${currentIndex + 1} / ${photos.length}`;
              }
            };

            const prevBtn = document.getElementById(`${photoId}-prev`);
            const nextBtn = document.getElementById(`${photoId}-next`);

            if (prevBtn) {
              prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIndex = (currentIndex - 1 + photos.length) % photos.length;
                updatePhoto(newIndex);
              });
            }

            if (nextBtn) {
              nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIndex = (currentIndex + 1) % photos.length;
                updatePhoto(newIndex);
              });
            }
          });
        }

        clusterGroup.addLayer(marker);
      }
    });


    // Assign ke ref setelah semua marker ditambahkan

    clusterRef.current = clusterGroup;

    map.addLayer(clusterGroup);

    return () => {
      if (clusterRef.current && map) {
        map.removeLayer(clusterRef.current);
        clusterRef.current.clearLayers();
        clusterRef.current = null;
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

    const clusterGroup = new MarkerClusterGroup({
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
              📹 ${cctv.name}
            </div>
            ${cctv.url_cctv ? `
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                URL:  
                <a 
                  href="${cctv.url_cctv}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style="color: #2563eb; text-decoration: underline;"
                >
                  ${cctv.url_cctv}
                </a>
              </div>
            ` : ''}
            ${cctv.description ? `
              <div style="font-size: 12px; color: #64748b;">
                ${cctv.description}
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        clusterGroup.addLayer(marker);
      }
    });


    // Assign ke ref setelah semua marker ditambahkan

    clusterRef.current = clusterGroup;

    map.addLayer(clusterGroup);

    return () => {
      if (clusterRef.current && map) {
        map.removeLayer(clusterRef.current);
        clusterRef.current.clearLayers();
        clusterRef.current = null;
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
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);

  // ========== TAMBAHAN: State untuk klasifikasi area ==========
  const [areaClassifications, setAreaClassifications] = useState<Map<number, AreaClassification>>(new Map());
  // ============================================================

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ========== TAMBAHAN: Fetch klasifikasi area ==========
  useEffect(() => {
    if (isMounted) {
      const fetchClassifications = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/map/area-classifications/');
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data.areas) {
              const classificationsMap = new Map();
              result.data.areas.forEach((area: AreaClassification) => {
                classificationsMap.set(area.id, area);
              });
              setAreaClassifications(classificationsMap);
              console.log('✅ Classifications loaded:', result.data.areas.length, 'areas');
            }
          }
        } catch (error) {
          console.error('Error fetching classifications:', error);
        }
      };

      fetchClassifications();
    }
  }, [isMounted]);
  // =======================================================

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

  // ========== UPDATE: Style function dengan klasifikasi ==========
  const style = (feature: any) => {
    const isSelected = selectedRegion?.id === feature.id;
    const isHovered = hoveredRegion?.id === feature.id;

    // Ambil warna dari klasifikasi
    const areaId = feature.id;
    const classification = areaClassifications.get(areaId);
    const fillColor = classification?.color || feature.properties.color || '#94a3b8';

    return {
      fillColor: fillColor, // Gunakan warna klasifikasi
      weight: isSelected ? 3 : isHovered ? 2 : 1,
      opacity: 1,
      color: isSelected ? "#1e293b" : isHovered ? "#475569" : "#94a3b8",
      fillOpacity: isSelected ? 0.6 : isHovered ? 0.5 : 0.4,
    };
  };
  // ==============================================================

  // ========== UPDATE: onEachFeature dengan info klasifikasi ==========
  const onEachFeature = (feature: any, layer: any) => {
    // Ambil klasifikasi untuk area ini
    const areaId = feature.id;
    const classification = areaClassifications.get(areaId);

    layer.on({
      click: (e: any) => {
        L.DomEvent.stopPropagation(e);
        // Pass klasifikasi ke onRegionClick
        onRegionClick({
          ...feature,
          properties: {
            ...feature.properties,
            classification: classification?.classification,
            classification_color: classification?.color,
            total_cases: classification?.total_cases,
          }
        });
      },
      mouseover: (e: any) => {
        setHoveredRegion(feature);
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: "#475569",
          fillOpacity: 0.6,
        });

        // Tooltip dengan info klasifikasi
        const tooltipContent = `
          <div style="padding: 8px 12px; font-family: system-ui, sans-serif;">
            <div style="font-weight: 600; font-size: 13px; color: #1e293b;">${feature.properties.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              ${feature.properties.kecamatan}, ${feature.properties.desa}
            </div>
            ${feature.properties.luas ? `
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                Luas: ${feature.properties.luas.toFixed(2)} km²
              </div>
            ` : ''}
            ${classification ? `
              <div style="margin-top: 6px;">
                <span style="
                  display: inline-block;
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-weight: bold;
                  background-color: ${classification.color}20;
                  color: ${classification.color};
                  border: 1px solid ${classification.color};
                ">
                  ${classification.classification} (${classification.total_cases} kasus)
                </span>
              </div>
            ` : ''}
          </div>
        `;

        layer.bindTooltip(tooltipContent, { sticky: true, className: "custom-tooltip" }).openTooltip();
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
  // ====================================================================

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
        zoomControl={false}
        style={{ background: "#e2e8f0" }}
      >
        {/* Base Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* GeoJSON Layer untuk areas - selalu ditampilkan dengan warna klasifikasi */}
        {mapData?.areas && (
          <GeoJSON
            ref={geoJsonRef}
            data={mapData.areas}
            style={style}
            onEachFeature={onEachFeature}
            key={`geojson-${selectedRegion?.id || "default"}-${areaClassifications.size}`}
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

      {/* Custom Zoom + Layer Control - Gabungan */}
      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg z-[1000] w-[34px]">
        {/* Zoom In Button */}
        <button
          onClick={() => {
            const map = (document.querySelector('.leaflet-container') as any)?._leafletMap;
            if (map) map.zoomIn();
          }}
          className="w-full h-[34px] flex items-center justify-center hover:bg-slate-50 transition-colors border-b border-slate-200"
          title="Zoom in"
        >
          <span className="text-lg font-semibold text-slate-700">+</span>
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => {
            const map = (document.querySelector('.leaflet-container') as any)?._leafletMap;
            if (map) map.zoomOut();
          }}
          className="w-full h-[34px] flex items-center justify-center hover:bg-slate-50 transition-colors border-b border-slate-200"
          title="Zoom out"
        >
          <span className="text-lg font-semibold text-slate-700">−</span>
        </button>

        {/* Layer Control Button */}
        <button
          onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
          className="w-full h-[34px] flex items-center justify-center hover:bg-slate-50 transition-colors rounded-b-lg"
          title="Layer Peta"
        >
          <svg 
            className={`w-5 h-5 text-slate-700 transition-transform duration-200 ${isLayerControlOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </button>
        
        {/* Layer Control Content */}
        <div 
          className={`absolute top-0 left-[42px] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
            isLayerControlOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <div className="px-3 py-3 space-y-2 w-max">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showCrimes}
                onChange={(e) => setShowCrimes(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
              />
              <span className="text-xs text-slate-600 flex items-center gap-1.5 group-hover:text-slate-800 transition-colors whitespace-nowrap">
                <span className="w-3 h-3 bg-red-600 rounded-full inline-block shadow-sm"></span>
                Laporan Kejahatan
              </span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showSecurity}
                onChange={(e) => setShowSecurity(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-xs text-slate-600 flex items-center gap-1.5 group-hover:text-slate-800 transition-colors whitespace-nowrap">
                <span className="w-3 h-3 bg-green-600 rounded-full inline-block shadow-sm"></span>
                Pos Keamanan
              </span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showCCTV}
                onChange={(e) => setShowCCTV(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 flex items-center gap-1.5 group-hover:text-slate-800 transition-colors whitespace-nowrap">
                <span className="w-3 h-3 bg-blue-600 rounded-full inline-block shadow-sm"></span>
                CCTV
              </span>
            </label>
          </div>
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
    </div>
  );
};

export default CrimeMap;