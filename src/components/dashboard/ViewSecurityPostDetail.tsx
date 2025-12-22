//src/components/dashboard/ViewSecurityPostDetail.tsx
"use client";

import { useState } from 'react';
import { X, MapPin, Home, Image as ImageIcon, Calendar, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PosKeamanan } from '@/lib/api/securityPost';

interface ViewSecurityPostDetailProps {
  data: PosKeamanan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewSecurityPostDetail({ data, open, onOpenChange }: ViewSecurityPostDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Extract coordinates from POINT string
  const extractCoordinates = (lokasi: string | undefined) => {
    if (!lokasi) return null;
    const match = lokasi.match(/POINT \(([0-9.-]+) ([0-9.-]+)\)/);
    if (match) {
      return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
    }
    return null;
  };

  const coords = extractCoordinates(data.lokasi);

  const openGoogleMaps = () => {
    if (coords) {
      window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
    }
  };

  const nextImage = () => {
    if (data.foto.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % data.foto.length);
    }
  };

  const prevImage = () => {
    if (data.foto.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + data.foto.length) % data.foto.length);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Home className="h-6 w-6" />
              Detail Pos Keamanan
            </DialogTitle>
            <DialogDescription>
              ID Pos: POS{data.id.toString().padStart(3, '0')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informasi Utama */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Informasi Pos Keamanan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Nama Pos</p>
                  <p className="font-medium text-lg">{data.nama}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Lokasi</p>
                  <p className="font-medium">{data.desa_nama}, {data.kecamatan_nama}</p>
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Alamat</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed">{data.alamat}</p>
              </div>
            </div>

            {/* Keterangan */}
            {data.keterangan && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Keterangan</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{data.keterangan}</p>
                </div>
              </div>
            )}

            {/* Lokasi di Map */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lokasi di Peta
              </h3>
              {coords && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Koordinat</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openGoogleMaps}
                      className="gap-2"
                    >
                      <MapPin className="h-3 w-3" />
                      Buka di Maps
                    </Button>
                  </div>
                  <p className="font-mono text-sm">
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Photo Gallery */}
            {data.foto && data.foto.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Foto Pos ({data.foto.length})
                </h3>

                {/* Main Image */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                  <img
                    src={data.foto[selectedImageIndex].file_path}
                    alt={data.foto[selectedImageIndex].file_name}
                    className="w-full h-full object-contain"
                  />

                  {/* Image Controls */}
                  {data.foto.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Fullscreen Button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>

                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {data.foto.length}
                  </div>
                </div>

                {/* Caption */}
                <p className="text-sm text-muted-foreground text-center">
                  {data.foto[selectedImageIndex].file_name}
                </p>

                {/* Thumbnails */}
                {data.foto.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {data.foto.map((foto, index) => (
                      <button
                        key={foto.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === selectedImageIndex
                            ? 'border-primary scale-95'
                            : 'border-transparent hover:border-muted-foreground'
                          }`}
                      >
                        <img
                          src={foto.file_path}
                          alt={foto.file_name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <div>
                    <p className="font-medium mb-1">Dibuat pada</p>
                    <p>{new Date(data.created_at).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">Terakhir diupdate</p>
                  <p>{new Date(data.updated_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox for Fullscreen Image */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {data.foto && data.foto.length > 0 && (
              <>
                <img
                  src={data.foto[selectedImageIndex].file_path}
                  alt={data.foto[selectedImageIndex].file_name}
                  className="max-w-full max-h-full object-contain"
                />

                {data.foto.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
                  <p className="text-sm font-medium">
                    {data.foto[selectedImageIndex].file_name}
                  </p>
                  <p className="text-xs text-center mt-1">
                    {selectedImageIndex + 1} / {data.foto.length}
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}