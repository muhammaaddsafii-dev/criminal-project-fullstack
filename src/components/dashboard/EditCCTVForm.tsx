"use client";

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { MapPicker } from '@/components/dashboard/MapPicker';
import {
  getKecamatan,
  getDesa,
  updateCCTV,
  uploadCCTVPhoto,
  deleteCCTVPhoto,
  type Kecamatan,
  type Desa,
  type CCTV,
  type FotoCCTV,
} from '@/lib/api/cctv';

interface EditCCTVFormProps {
  data: CCTV;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: CCTV) => void;
}

export function EditCCTVForm({ data, open, onOpenChange, onUpdate }: EditCCTVFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Master data
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);

  // Extract coordinates from POINT string
  const extractCoordinates = (lokasi: string | undefined) => {
    if (!lokasi) return { lat: -7.7956, lng: 110.3695 };
    const match = lokasi.match(/POINT \(([0-9.-]+) ([0-9.-]+)\)/);
    if (match) {
      return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
    }
    return { lat: -7.7956, lng: 110.3695 };
  };

  const coords = extractCoordinates(data.lokasi);

  // Form data
  const [formData, setFormData] = useState({
    nama_lokasi: data.nama_lokasi,
    kecamatan: data.kecamatan.toString(),
    desa: data.desa.toString(),
    deskripsi: data.deskripsi || '',
    url_cctv: data.url_cctv || '',
    longitude: coords.lng,
    latitude: coords.lat,
  });

  // Existing photos
  const [existingPhotos, setExistingPhotos] = useState<FotoCCTV[]>(data.foto || []);
  const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);

  // New photos
  const [newPhotos, setNewPhotos] = useState<{ file: File; fileName: string; preview: string }[]>([]);

  // Load master data
  useEffect(() => {
    if (open) {
      loadMasterData();
    }
  }, [open]);

  // Load desa when kecamatan changes
  useEffect(() => {
    if (formData.kecamatan) {
      loadDesa(parseInt(formData.kecamatan));
    }
  }, [formData.kecamatan]);

  const loadMasterData = async () => {
    try {
      const [kecamatan] = await Promise.all([
        getKecamatan(),
      ]);
      setKecamatanList(kecamatan);

      // Load dependent data
      if (formData.kecamatan) {
        await loadDesa(parseInt(formData.kecamatan));
      }
    } catch (error) {
      console.error('Error loading master data:', error);
      alert('Gagal memuat data master');
    }
  };

  const loadDesa = async (kecamatanId: number) => {
    try {
      const data = await getDesa(kecamatanId);
      setDesaList(data);
    } catch (error) {
      console.error('Error loading desa:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} bukan gambar`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar (max 5MB)`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPhotos(prev => [...prev, {
          file,
          fileName: file.name.split('.')[0],
          preview: e.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const markPhotoForDeletion = (photoId: number) => {
    setPhotosToDelete(prev => [...prev, photoId]);
    setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const updatePhotoFileName = (index: number, fileName: string) => {
    setNewPhotos(prev => prev.map((photo, i) =>
      i === index ? { ...photo, fileName } : photo
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_lokasi.trim()) {
      newErrors.nama_lokasi = 'Nama lokasi harus diisi';
    }
    if (!formData.kecamatan) {
      newErrors.kecamatan = 'Kecamatan harus dipilih';
    }
    if (!formData.desa) {
      newErrors.desa = 'Desa harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 1. Update CCTV data
      const updateData = {
        nama_lokasi: formData.nama_lokasi,
        kecamatan: parseInt(formData.kecamatan),
        desa: parseInt(formData.desa),
        deskripsi: formData.deskripsi,
        url_cctv: formData.url_cctv,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const updatedCCTV = await updateCCTV(data.id, updateData);

      // 2. Delete marked photos
      if (photosToDelete.length > 0) {
        await Promise.all(photosToDelete.map(photoId => deleteCCTVPhoto(photoId)));
      }

      // 3. Upload new photos
      if (newPhotos.length > 0) {
        await Promise.all(
          newPhotos.map(photo => uploadCCTVPhoto(data.id, photo.file, photo.fileName))
        );
      }

      // 4. Fetch updated data with photos
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/cctv/${data.id}/`);
      const finalData = await response.json();

      onUpdate(finalData);
      onOpenChange(false);
      alert('Data berhasil diupdate!');

      // Reset state
      setPhotosToDelete([]);
      setNewPhotos([]);
    } catch (error: any) {
      console.error('Error updating CCTV:', error);
      alert(`Gagal mengupdate data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data CCTV</DialogTitle>
          <DialogDescription>
            Update informasi CCTV
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lokasi */}
          <div className="space-y-2">
            <Label htmlFor="nama_lokasi">Nama Lokasi *</Label>
            <Input
              id="nama_lokasi"
              value={formData.nama_lokasi}
              onChange={(e) => handleChange('nama_lokasi', e.target.value)}
              className={errors.nama_lokasi ? 'border-destructive' : ''}
            />
            {errors.nama_lokasi && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.nama_lokasi}
              </p>
            )}
          </div>

          {/* Kecamatan & Desa - Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kecamatan">Kecamatan *</Label>
              <Select
                value={formData.kecamatan}
                onValueChange={(value) => handleChange('kecamatan', value)}
              >
                <SelectTrigger className={errors.kecamatan ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Pilih kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  {kecamatanList.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kecamatan && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.kecamatan}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="desa">Desa *</Label>
              <Select
                value={formData.desa}
                onValueChange={(value) => handleChange('desa', value)}
                disabled={!formData.kecamatan}
              >
                <SelectTrigger className={errors.desa ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Pilih desa" />
                </SelectTrigger>
                <SelectContent>
                  {desaList.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.desa && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.desa}
                </p>
              )}
            </div>
          </div>

          {/* URL CCTV */}
          <div className="space-y-2">
            <Label htmlFor="url_cctv">URL CCTV</Label>
            <Input
              id="url_cctv"
              type="url"
              value={formData.url_cctv}
              onChange={(e) => handleChange('url_cctv', e.target.value)}
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleChange('deskripsi', e.target.value)}
              rows={3}
            />
          </div>

          {/* Map Picker */}
          <div className="space-y-2">
            <MapPicker
              value={{ lat: formData.latitude, lng: formData.longitude }}
              onChange={(location) => {
                handleChange('latitude', location.lat);
                handleChange('longitude', location.lng);
              }}
            />
          </div>

          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <Label>Foto Saat Ini</Label>
              <div className="grid grid-cols-2 gap-4">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="relative border rounded-lg p-2">
                    <img
                      src={photo.file_path}
                      alt={photo.file_name}
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => markPhotoForDeletion(photo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <p className="text-xs mt-2 text-center">{photo.file_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Photos */}
          <div className="space-y-2">
            <Label>Tambah Foto Baru</Label>
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('photos')?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Pilih Foto
            </Button>
            {newPhotos.length > 0 && (
              <p className="text-sm text-muted-foreground">{newPhotos.length} foto baru dipilih</p>
            )}
          </div>

          {/* New Photo Previews */}
          {newPhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {newPhotos.map((photo, index) => (
                <div key={index} className="relative border rounded-lg p-2 space-y-2">
                  <img
                    src={photo.preview}
                    alt={photo.fileName}
                    className="w-full h-32 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() => removeNewPhoto(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Input
                    value={photo.fileName}
                    onChange={(e) => updatePhotoFileName(index, e.target.value)}
                    className="text-xs h-7"
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
              disabled={loading}
            >
              <X className="h-4 w-4" />
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
