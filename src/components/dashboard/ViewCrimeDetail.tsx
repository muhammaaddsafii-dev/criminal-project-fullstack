"use client";

import { useState } from 'react';
import { X, MapPin, Calendar, Clock, User, FileText, CheckCircle, Image as ImageIcon, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { LaporanKejahatan } from '@/lib/api/crime';

interface ViewCrimeDetailProps {
    data: LaporanKejahatan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewCrimeDetail({ data, open, onOpenChange }: ViewCrimeDetailProps) {
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

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time
    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5); // HH:MM
    };

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
                            <FileText className="h-6 w-6" />
                            Detail Laporan Kejahatan
                        </DialogTitle>
                        <DialogDescription>
                            ID Laporan: KRM{data.id.toString().padStart(3, '0')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <StatusBadge status={data.status_nama} />
                            {data.is_approval && (
                                <Badge className="bg-success text-success-foreground">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Disetujui
                                </Badge>
                            )}
                        </div>


                        {/* Informasi Pelapor */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informasi Pelapor
                            </h3>
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nama Pelapor</p>
                                        <p className="font-medium">{data.nama_pelapor}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tanggal Laporan</p>
                                        <p className="font-medium">
                                            {new Date(data.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Kejadian */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Detail Kejadian</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="bg-muted/50 rounded-lg p-3">
                                        <p className="text-sm text-muted-foreground mb-1">Jenis Kejahatan</p>
                                        <p className="font-medium">{data.jenis_kejahatan_nama}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-3">
                                        <p className="text-sm text-muted-foreground mb-1">Nama Kejahatan</p>
                                        <p className="font-medium">{data.nama_kejahatan_nama}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
                                        <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground mb-1">Tanggal Kejadian</p>
                                            <p className="font-medium">{formatDate(data.tanggal_kejadian)}</p>
                                        </div>
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
                                        <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground mb-1">Waktu Kejadian</p>
                                            <p className="font-medium">{formatTime(data.waktu_kejadian)} WIB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lokasi Kejadian */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Lokasi Kejadian
                            </h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-muted/50 rounded-lg p-3">
                                        <p className="text-sm text-muted-foreground mb-1">Kecamatan</p>
                                        <p className="font-medium">{data.kecamatan_nama}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-3">
                                        <p className="text-sm text-muted-foreground mb-1">Desa/Kelurahan</p>
                                        <p className="font-medium">{data.desa_nama}</p>
                                    </div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-sm text-muted-foreground mb-1">Alamat Lengkap</p>
                                    <p className="font-medium">{data.alamat}</p>
                                </div>
                                {coords && (
                                    <div className="bg-muted/50 rounded-lg p-3">
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
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Deskripsi Kejadian</h3>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.deskripsi}</p>
                            </div>
                        </div>

                        {/* Photo Gallery */}
                        {data.foto && data.foto.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Foto Bukti ({data.foto.length})
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                                <div>
                                    <p className="font-medium mb-1">Dibuat pada</p>
                                    <p>{new Date(data.created_at).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Terakhir diupdate</p>
                                    <p>{new Date(data.updated_at).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Status Approval</p>
                                    <p>{data.is_approval ? 'Sudah Disetujui' : 'Belum Disetujui'}</p>
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