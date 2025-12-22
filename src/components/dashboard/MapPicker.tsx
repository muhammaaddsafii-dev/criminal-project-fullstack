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

export function MapPicker({ value, onChange }: MapPickerProps) {
  const [position, setPosition] = useState(value || { lat: -7.7956, lng: 110.3695 }); // Yogyakarta default
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS and JS
    if (typeof window !== 'undefined') {
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
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([position.lat, position.lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([position.lat, position.lng], {
      draggable: true,
    }).addTo(map);

    // Handle marker drag
    marker.on('dragend', (e: any) => {
      const latLng = e.target.getLatLng();
      const newPosition = { lat: latLng.lat, lng: latLng.lng };
      setPosition(newPosition);
      onChange(newPosition);
      reverseGeocode(newPosition);
    });

    // Handle map click
    map.on('click', (e: any) => {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPosition);
      onChange(newPosition);
      marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(newPosition);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Initial reverse geocode
    reverseGeocode(position);
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
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Tidak dapat mengakses lokasi Anda');
        }
      );
    }
  };

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
    </div>
  );
}