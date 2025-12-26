"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number }) => void;
}

// Interface untuk klasifikasi (SAMA dengan CrimeMap)
interface AreaClassification {
  id: number;
  name: string;
  total_cases: number;
  classification: 'RENDAH' | 'SEDANG' | 'TINGGI';
  color: string;
  level: number;
  desa_id: number;
}

export function MapPicker({ value, onChange }: MapPickerProps) {
  const [position, setPosition] = useState(
    value || { lat: -2.860063, lng: 122.164536 } // Morowali -2.860063, 122.164536
  );

  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geoJsonLayerRef = useRef<any>(null);
  
  // State untuk klasifikasi area (SAMA dengan CrimeMap)
  const [areaClassifications, setAreaClassifications] = useState<Map<number, AreaClassification>>(new Map());
  const [selectedAreaInfo, setSelectedAreaInfo] = useState<string>('');
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Load Leaflet CSS and JS
    if (typeof window !== 'undefined' && isMounted) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);

      return () => {
        document.head.removeChild(link);
        document.body.removeChild(script);
      };
    }
  }, [isMounted]);

  // ========== Fetch klasifikasi area (PATTERN SAMA dengan CrimeMap) ==========
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
  // ===========================================================================

  // ========== Fetch GeoJSON data (PATTERN SAMA dengan CrimeMap) ==========
  useEffect(() => {
    if (isMounted) {
      const fetchMapData = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/map/data/');
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data.areas) {
              setGeoJsonData(result.data.areas);
            }
          }
        } catch (error) {
          console.error("Error fetching map data:", error);
        }
      };

      fetchMapData();
    }
  }, [isMounted]);
  // =======================================================================

  // ========== Render polygons saat data ready ==========
  useEffect(() => {
    if (mapInstanceRef.current && geoJsonData && areaClassifications.size > 0) {
      renderAreaPolygons(geoJsonData);
    }
  }, [mapInstanceRef.current, geoJsonData, areaClassifications]);
  // ======================================================

  const renderAreaPolygons = (geoJsonDataToRender: any) => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Remove existing layer
    if (geoJsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
    }

    // Add new GeoJSON layer (STYLE SAMA dengan CrimeMap)
    const geoJsonLayer = L.geoJSON(geoJsonDataToRender, {
      style: (feature: any) => {
        // Ambil warna dari klasifikasi (LOGIC SAMA dengan CrimeMap)
        const areaId = feature.id;
        const classification = areaClassifications.get(areaId);
        const fillColor = classification?.color || feature.properties.color || '#94a3b8';

        return {
          fillColor: fillColor,
          weight: 1.5,
          opacity: 1,
          color: '#ffffff',
          fillOpacity: 0.6,
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const areaId = feature.id;
        const classification = areaClassifications.get(areaId);

        // Tooltip (SAMA dengan CrimeMap)
        const tooltipContent = `
          <div style="font-family: system-ui; padding: 4px;">
            <div style="font-weight: 600; font-size: 12px; color: #1e293b;">
              ${feature.properties.name}
            </div>
            ${classification ? `
              <div style="margin-top: 4px;">
                <span style="
                  display: inline-block;
                  padding: 2px 6px;
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

        layer.bindTooltip(tooltipContent, {
          sticky: false,
          direction: 'top'
        });

        // Hover effect (SAMA dengan CrimeMap)
        layer.on('mouseover', (e: any) => {
          layer.setStyle({
            weight: 3,
            fillOpacity: 0.8,
          });
        });

        layer.on('mouseout', (e: any) => {
          geoJsonLayer.resetStyle(layer);
        });
      },
    });

    geoJsonLayer.addTo(mapInstanceRef.current);
    geoJsonLayerRef.current = geoJsonLayer;
  };

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(
      [-2.860063, 122.164536], // Morowali
      9
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([-2.860063, 122.164536], { //
      draggable: true,
    }).addTo(map);

    // Handle marker drag
    marker.on('dragend', (e: any) => {
      const latLng = e.target.getLatLng();
      const newPosition = { lat: latLng.lat, lng: latLng.lng };
      setPosition(newPosition);
      onChange(newPosition);
      reverseGeocode(newPosition);
      checkAreaAtPosition(newPosition);
    });

    // Handle map click
    map.on('click', (e: any) => {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPosition);
      onChange(newPosition);
      marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(newPosition);
      checkAreaAtPosition(newPosition);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Initial reverse geocode
    reverseGeocode(position);
    checkAreaAtPosition(position);
  };

  const checkAreaAtPosition = (pos: { lat: number; lng: number }) => {
    if (!geoJsonLayerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const point = L.latLng(pos.lat, pos.lng);
    let foundArea = false;

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      if (layer.getBounds && layer.getBounds().contains(point)) {
        const feature = layer.feature;
        const areaId = feature.id;
        const classification = areaClassifications.get(areaId);

        if (classification) {
          const emoji = classification.classification === 'TINGGI' ? '🔴' : 
                       classification.classification === 'SEDANG' ? '🟡' : '🟢';
          
          setSelectedAreaInfo(
            `${emoji} Area: ${feature.properties.name} - Tingkat: ${classification.classification} (${classification.total_cases} kasus)`
          );
          foundArea = true;
        } else {
          setSelectedAreaInfo(`📍 Area: ${feature.properties.name}`);
          foundArea = true;
        }
      }
    });

    if (!foundArea) {
      setSelectedAreaInfo('');
    }
  };

  const reverseGeocode = async (pos: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`
      );
      const data = await response.json();
      setAddress(data.display_name || '');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newPosition = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setPosition(newPosition);
        onChange(newPosition);
        setAddress(result.display_name);

        // Update map
        if (mapInstanceRef.current && markerRef.current) {
          const L = (window as any).L;
          mapInstanceRef.current.setView([newPosition.lat, newPosition.lng], 15);
          markerRef.current.setLatLng([newPosition.lat, newPosition.lng]);
          checkAreaAtPosition(newPosition);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setPosition(newPosition);
          onChange(newPosition);

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([newPosition.lat, newPosition.lng], 15);
            markerRef.current.setLatLng([newPosition.lat, newPosition.lng]);
          }

          reverseGeocode(newPosition);
          checkAreaAtPosition(newPosition);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Tidak dapat mengakses lokasi Anda');
        }
      );
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Pilih Lokasi Kejadian</Label>
        <div className="h-64 w-full bg-slate-100 rounded-lg flex items-center justify-center">
          <p className="text-slate-500 text-sm">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Pilih Lokasi Kejadian</Label>

      {/* Search Box */}
      <div className="flex gap-2">
        <Input
          placeholder="Cari alamat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button type="button" onClick={handleSearch} variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button type="button" onClick={getCurrentLocation} variant="outline" size="icon" title="Lokasi Saya">
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="h-64 w-full rounded-lg border border-border overflow-hidden"
        style={{ zIndex: 0 }}
      />

      {/* Loading indicator */}
      {(!geoJsonData || areaClassifications.size === 0) && (
        <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 p-2 rounded-md flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span>Memuat data klasifikasi area...</span>
        </div>
      )}

      {/* Info area yang dipilih */}
      {selectedAreaInfo && (
        <div className="text-sm bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-md">
          <strong>📍 Lokasi:</strong> {selectedAreaInfo}
        </div>
      )}

      {/* Address Display */}
      {address && (
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
          <strong>Alamat:</strong> {address}
        </div>
      )}

      {/* Coordinates Display */}
      <div className="text-xs text-muted-foreground">
        Koordinat: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
      </div>

      {/* Legend - WARNA SAMA dengan CrimeMap */}
      <div className="bg-white border rounded-lg p-2">
        <div className="text-xs font-semibold text-slate-700 mb-1.5">
          Tingkat Kriminalitas Area
        </div>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-slate-600">Tinggi</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-slate-600">Sedang</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-slate-600">Rendah</span>
          </div>
        </div>
      </div>

      {/* Debug panel - development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded font-mono">
          <div className="flex gap-3">
            <span>Classifications: {areaClassifications.size > 0 ? `✓ ${areaClassifications.size}` : '✗'}</span>
            <span>GeoJSON: {geoJsonData ? '✓' : '✗'}</span>
            <span>Map: {mapInstanceRef.current ? '✓' : '✗'}</span>
          </div>
        </div>
      )}
    </div>
  );
}