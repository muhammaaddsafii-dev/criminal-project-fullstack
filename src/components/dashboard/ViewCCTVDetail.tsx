"use client";

import { useState } from 'react';
import { X, MapPin, Video, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CCTV } from '@/lib/api/cctv';

interface ViewCCTVDetailProps {
  data: CCTV;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewCCTVDetail({ data, open, onOpenChange }: ViewCCTVDetailProps) {
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail CCTV</DialogTitle>
            <DialogDescription>
              ID: CCTV{data.id.toString().padStart(3, '0')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informasi CCTV */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Informasi CCTV</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama Lokasi</p>
                  <p className="font-medium">{data.nama_lokasi}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kecamatan</p>
                  <p className="font-medium">{data.kecamatan_nama}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Desa/Kelurahan</p>
                  <p className="font-medium">{data.desa_nama}</p>
                </div>
                {data.url_cctv && (
                  <div>
                    <p className="text-sm text-muted-foreground">URL Stream</p>
                    <a 
                      href={data.url_cctv} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Buka Stream
                    </a>
                  </div>
                )}
              </div>

              {data.deskripsi && (
                <div>
                  <p className="text-sm text-muted-foreground">Deskripsi</p>
                  <p className="font-medium">{data.deskripsi}</p>
                </div>
              )}
            </div>

            {/* Lokasi */}
            {coords && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Lokasi</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
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
              </div>
            )}

            {/* Photo Gallery */}
            {data.foto && data.foto.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Foto CCTV ({data.foto.length})
                </h3>

                <div className="relative">
                  {/* Main Image */}
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
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
                          className="absolute left-2 top-1/2 -translate-y-1/2"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
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
                      className="absolute top-2 right-2"
                      onClick={() => setLightboxOpen(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>

                    {/* Image Counter */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {data.foto.length}
                    </div>
                  </div>

                  {/* Caption */}
                  <p className="text-sm text-center text-muted-foreground mt-2">
                    {data.foto[selectedImageIndex].file_name}
                  </p>

                  {/* Thumbnails */}
                  {data.foto.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {data.foto.map((foto, index) => (
                        <button
                          key={foto.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedImageIndex
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
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
              <div>
                <p className="text-muted-foreground">Dibuat pada</p>
                <p>{new Date(data.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Terakhir diupdate</p>
                <p>{new Date(data.updated_at).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox for Fullscreen Image */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-2">
          {data.foto && data.foto.length > 0 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={data.foto[selectedImageIndex].file_path}
                alt={data.foto[selectedImageIndex].file_name}
                className="max-w-full max-h-full object-contain"
              />

              {data.foto.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 space-y-2 text-center">
                <div className="bg-black/70 text-white px-4 py-2 rounded-full">
                  {data.foto[selectedImageIndex].file_name}
                </div>
                <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {data.foto.length}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
