// src/components/dashboard/EditKejadianLainnyaForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  updateKejadianLainnya,
  uploadPhoto,
  deletePhoto,
  toggleApprovalKejadianLainnya,
  type KejadianLainnya,
} from '@/lib/api/kejadian-lainnya';
import { getKecamatan, type Kecamatan } from '@/lib/api/kecamatan';
import { getDesa, type Desa } from '@/lib/api/desa';
import { getStatus, type Status } from '@/lib/api/crime';
import { MapPicker } from '@/components/dashboard/MapPicker';

interface EditKejadianLainnyaFormProps {
  data: KejadianLainnya;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedKejadian: KejadianLainnya) => void;
}

export function EditKejadianLainnyaForm({ data, open, onOpenChange, onUpdate }: EditKejadianLainnyaFormProps) {
  const [loading, setLoading] = useState(false);
  
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [existingPhotos, setExistingPhotos] = useState(data.foto);
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string; fileName: string }[]>([]);
  const [isApproved, setIsApproved] = useState(data.is_approval);
  
  // Parse location from data if exists
  const initialLocation = data.lokasi ? (() => {
    try {
      const coords = data.lokasi.split(',').map(c => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return { lat: coords[0], lng: coords[1] };
      }
    } catch (e) {
      console.error('Error parsing location:', e);
    }
    return undefined;
  })() : undefined;
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>(initialLocation);

  const [formData, setFormData] = useState({
    nama_pelapor: data.nama_pelapor,
    nama_kejadian: data.nama_kejadian,
    deskripsi_kejadian: data.deskripsi_kejadian,
    tanggal_kejadian: data.tanggal_kejadian,
    waktu_kejadian: data.waktu_kejadian,
    kecamatan: data.kecamatan.toString(),
    desa: data.desa.toString(),
    status: data.status.toString(),
  });

  useEffect(() => {
    if (open) {
      loadMasterData();
      setFormData({
        nama_pelapor: data.nama_pelapor,
        nama_kejadian: data.nama_kejadian,
        deskripsi_kejadian: data.deskripsi_kejadian,
        tanggal_kejadian: data.tanggal_kejadian,
        waktu_kejadian: data.waktu_kejadian,
        kecamatan: data.kecamatan.toString(),
        desa: data.desa.toString(),
        status: data.status.toString(),
      });
      setExistingPhotos(data.foto);
      setNewPhotos([]);
      setIsApproved(data.is_approval);
      
      // Reset location from data
      const loc = data.lokasi ? (() => {
        try {
          const coords = data.lokasi.split(',').map(c => parseFloat(c.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            return { lat: coords[0], lng: coords[1] };
          }
        } catch (e) {
          console.error('Error parsing location:', e);
        }
        return undefined;
      })() : undefined;
      setLocation(loc);
    }
  }, [data, open]);

  useEffect(() => {
    if (formData.kecamatan) {
      loadDesa(parseInt(formData.kecamatan));
    }
  }, [formData.kecamatan]);

  const loadMasterData = async () => {
    try {
      // Fetch all kecamatan (without pagination limit)
      const kecamatanRes = await getKecamatan({});
      const allKecamatan: Kecamatan[] = [];
      let currentPage = 1;
      let hasMore = true;
      
      // Load first page
      allKecamatan.push(...kecamatanRes.results);
      
      // Load remaining pages if any
      while (kecamatanRes.next && hasMore) {
        currentPage++;
        const nextRes = await getKecamatan({ page: currentPage });
        allKecamatan.push(...nextRes.results);
        hasMore = nextRes.next !== null;
      }
      
      setKecamatanList(allKecamatan);
      
      // Load status
      const statusRes = await getStatus();
      setStatusList(statusRes);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const loadDesa = async (kecamatanId: number) => {
    try {
      const response = await getDesa({ kecamatan_id: kecamatanId });
      setDesaList(response.results);
    } catch (error) {
      console.error('Error loading desa:', error);
    }
  };

  const handleNewPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const photos = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      fileName: file.name,
    }));

    setNewPhotos((prev) => [...prev, ...photos]);
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => {
      const photos = [...prev];
      URL.revokeObjectURL(photos[index].preview);
      photos.splice(index, 1);
      return photos;
    });
  };

  const handleDeleteExistingPhoto = async (photoId: number) => {
    if (!confirm('Hapus foto ini?')) return;
    
    try {
      await deletePhoto(photoId);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (error: any) {
      alert(`Gagal menghapus foto: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const dataToUpdate: any = {
        nama_pelapor: formData.nama_pelapor,
        nama_kejadian: formData.nama_kejadian,
        deskripsi_kejadian: formData.deskripsi_kejadian,
        tanggal_kejadian: formData.tanggal_kejadian,
        waktu_kejadian: formData.waktu_kejadian,
        kecamatan: parseInt(formData.kecamatan),
        desa: parseInt(formData.desa),
        status: parseInt(formData.status),
      };

      // Add location if available
      if (location) {
        dataToUpdate.longitude = location.lng;
        dataToUpdate.latitude = location.lat;
      }
      
      // Update kejadian
      await updateKejadianLainnya(data.id, dataToUpdate);
      
      // Update approval status if changed
      if (isApproved !== data.is_approval) {
        await toggleApprovalKejadianLainnya(data.id, isApproved);
      }
      
      // Upload new photos
      if (newPhotos.length > 0) {
        await Promise.all(
          newPhotos.map((photo) =>
            uploadPhoto(data.id, photo.file, photo.fileName)
          )
        );
      }
      
      // Fetch updated data
      const updatedKejadian = {
        ...data,
        ...formData,
        kecamatan: parseInt(formData.kecamatan),
        desa: parseInt(formData.desa),
        status: parseInt(formData.status),
        is_approval: isApproved,
      } as KejadianLainnya;
      
      onUpdate(updatedKejadian);
      onOpenChange(false);
      
      alert('Data kejadian berhasil diperbarui!');
    } catch (error: any) {
      console.error('Error updating kejadian:', error);
      alert(`Gagal memperbarui data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Kejadian Lainnya</DialogTitle>
          <DialogDescription>
            Ubah informasi kejadian di bawah ini
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama_pelapor">Nama Pelapor *</Label>
            <Input
              id="nama_pelapor"
              value={formData.nama_pelapor}
              onChange={(e) => setFormData({ ...formData, nama_pelapor: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_kejadian">Nama Kejadian *</Label>
            <Input
              id="nama_kejadian"
              value={formData.nama_kejadian}
              onChange={(e) => setFormData({ ...formData, nama_kejadian: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi_kejadian">Deskripsi Kejadian *</Label>
            <Textarea
              id="deskripsi_kejadian"
              value={formData.deskripsi_kejadian}
              onChange={(e) => setFormData({ ...formData, deskripsi_kejadian: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal_kejadian">Tanggal Kejadian *</Label>
              <Input
                id="tanggal_kejadian"
                type="date"
                value={formData.tanggal_kejadian}
                onChange={(e) => setFormData({ ...formData, tanggal_kejadian: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waktu_kejadian">Waktu Kejadian *</Label>
              <Input
                id="waktu_kejadian"
                type="time"
                value={formData.waktu_kejadian}
                onChange={(e) => setFormData({ ...formData, waktu_kejadian: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kecamatan">Kecamatan *</Label>
            <Select
              value={formData.kecamatan}
              onValueChange={(value) => setFormData({ ...formData, kecamatan: value, desa: '' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kecamatanList.map((kec) => (
                  <SelectItem key={kec.id} value={kec.id.toString()}>
                    {kec.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desa">Desa *</Label>
            <Select
              value={formData.desa}
              onValueChange={(value) => setFormData({ ...formData, desa: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {desaList.map((desa) => (
                  <SelectItem key={desa.id} value={desa.id.toString()}>
                    {desa.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusList.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approval Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="approval">Status Approval</Label>
              <p className="text-sm text-muted-foreground">
                {isApproved ? 'Kejadian telah disetujui' : 'Kejadian menunggu persetujuan'}
              </p>
            </div>
            <Switch
              id="approval"
              checked={isApproved}
              onCheckedChange={setIsApproved}
            />
          </div>

          {/* Map Picker for Location */}
          <MapPicker
            value={location}
            onChange={setLocation}
          />

          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <Label>Foto Saat Ini</Label>
              <div className="grid grid-cols-3 gap-2">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.file_path}
                      alt={photo.file_name}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingPhoto(photo.id)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Photos */}
          <div className="space-y-2">
            <Label>Tambah Foto Baru</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('new-photo-upload')?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Foto
              </Button>
              <input
                id="new-photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewPhotoChange}
                className="hidden"
              />
            </div>
            {newPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {newPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}