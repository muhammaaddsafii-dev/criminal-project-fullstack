//src/components/dashboard/EditCrimeForm.tsx
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
  getJenisKejahatan,
  getNamaKejahatan,
  getKecamatan,
  getDesa,
  getStatus,
  updateLaporanKejahatan,
  uploadPhoto,
  deletePhoto,
  type JenisKejahatan,
  type NamaKejahatan,
  type Kecamatan,
  type Desa,
  type Status,
  type LaporanKejahatan,
  type FotoLaporanKejahatan,
} from '@/lib/api/crime';

interface EditCrimeFormProps {
  data: LaporanKejahatan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: LaporanKejahatan) => void;
}

export function EditCrimeForm({ data, open, onOpenChange, onUpdate }: EditCrimeFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Master data
  const [jenisKejahatanList, setJenisKejahatanList] = useState<JenisKejahatan[]>([]);
  const [namaKejahatanList, setNamaKejahatanList] = useState<NamaKejahatan[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  
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
    nama_pelapor: data.nama_pelapor,
    jenis_kejahatan: data.jenis_kejahatan.toString(),
    nama_kejahatan: data.nama_kejahatan.toString(),
    tanggal_kejadian: data.tanggal_kejadian,
    waktu_kejadian: data.waktu_kejadian,
    kecamatan: data.kecamatan.toString(),
    desa: data.desa.toString(),
    alamat: data.alamat,
    deskripsi: data.deskripsi,
    status: data.status.toString(),
    longitude: coords.lng,
    latitude: coords.lat,
  });
  
  // Existing photos
  const [existingPhotos, setExistingPhotos] = useState<FotoLaporanKejahatan[]>(data.foto || []);
  const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);
  
  // New photos
  const [newPhotos, setNewPhotos] = useState<{ file: File; fileName: string; preview: string }[]>([]);

  // Load master data
  useEffect(() => {
    if (open) {
      loadMasterData();
    }
  }, [open]);

  // Load nama kejahatan when jenis kejahatan changes
  useEffect(() => {
    if (formData.jenis_kejahatan) {
      loadNamaKejahatan(parseInt(formData.jenis_kejahatan));
    }
  }, [formData.jenis_kejahatan]);

  // Load desa when kecamatan changes
  useEffect(() => {
    if (formData.kecamatan) {
      loadDesa(parseInt(formData.kecamatan));
    }
  }, [formData.kecamatan]);

  const loadMasterData = async () => {
    try {
      const [jenis, kecamatan, status] = await Promise.all([
        getJenisKejahatan(),
        getKecamatan(),
        getStatus(),
      ]);
      
      setJenisKejahatanList(jenis);
      setKecamatanList(kecamatan);
      setStatusList(status);
      
      // Load dependent data
      if (formData.jenis_kejahatan) {
        await loadNamaKejahatan(parseInt(formData.jenis_kejahatan));
      }
      if (formData.kecamatan) {
        await loadDesa(parseInt(formData.kecamatan));
      }
    } catch (error) {
      console.error('Error loading master data:', error);
      alert('Gagal memuat data master');
    }
  };

  const loadNamaKejahatan = async (jenisId: number) => {
    try {
      const data = await getNamaKejahatan(jenisId);
      setNamaKejahatanList(data);
    } catch (error) {
      console.error('Error loading nama kejahatan:', error);
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
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} bukan gambar`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert(`File ${file.name} terlalu besar (max 5MB)`);
        return false;
      }
      return true;
    });

    // Create previews and add to new photos
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPhotos(prev => [...prev, {
          file,
          fileName: file.name.split('.')[0], // filename without extension
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

    if (!formData.nama_pelapor.trim()) {
      newErrors.nama_pelapor = 'Nama pelapor harus diisi';
    }
    if (!formData.jenis_kejahatan) {
      newErrors.jenis_kejahatan = 'Jenis kejahatan harus dipilih';
    }
    if (!formData.nama_kejahatan) {
      newErrors.nama_kejahatan = 'Nama kejahatan harus dipilih';
    }
    if (!formData.tanggal_kejadian) {
      newErrors.tanggal_kejadian = 'Tanggal kejadian harus diisi';
    }
    if (!formData.waktu_kejadian) {
      newErrors.waktu_kejadian = 'Waktu kejadian harus diisi';
    }
    if (!formData.kecamatan) {
      newErrors.kecamatan = 'Kecamatan harus dipilih';
    }
    if (!formData.desa) {
      newErrors.desa = 'Desa harus dipilih';
    }
    if (!formData.alamat.trim()) {
      newErrors.alamat = 'Alamat harus diisi';
    }
    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi harus diisi';
    }
    if (!formData.status) {
      newErrors.status = 'Status harus dipilih';
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
      // 1. Update laporan data
      const updateData = {
        nama_pelapor: formData.nama_pelapor,
        jenis_kejahatan: parseInt(formData.jenis_kejahatan),
        nama_kejahatan: parseInt(formData.nama_kejahatan),
        tanggal_kejadian: formData.tanggal_kejadian,
        waktu_kejadian: formData.waktu_kejadian,
        kecamatan: parseInt(formData.kecamatan),
        desa: parseInt(formData.desa),
        alamat: formData.alamat,
        deskripsi: formData.deskripsi,
        status: parseInt(formData.status),
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const updatedLaporan = await updateLaporanKejahatan(data.id, updateData);
      
      // 2. Delete marked photos
      if (photosToDelete.length > 0) {
        await Promise.all(photosToDelete.map(photoId => deletePhoto(photoId)));
      }
      
      // 3. Upload new photos
      if (newPhotos.length > 0) {
        await Promise.all(
          newPhotos.map(photo => uploadPhoto(data.id, photo.file, photo.fileName))
        );
      }
      
      // 4. Fetch updated data with photos
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/laporan-kejahatan/${data.id}/`);
      const finalData = await response.json();
      
      onUpdate(finalData);
      onOpenChange(false);
      alert('Data berhasil diupdate!');
      
      // Reset state
      setPhotosToDelete([]);
      setNewPhotos([]);
    } catch (error: any) {
      console.error('Error updating laporan:', error);
      alert(`Gagal mengupdate data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Data Kriminalitas</DialogTitle>
          <DialogDescription>
            Update informasi kejadian kriminal
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Pelapor */}
          <div className="space-y-2">
            <Label htmlFor="nama_pelapor" className="text-sm font-semibold">
              Nama Pelapor <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nama_pelapor"
              placeholder="Masukkan nama pelapor"
              value={formData.nama_pelapor}
              onChange={(e) => handleChange('nama_pelapor', e.target.value)}
              className={errors.nama_pelapor ? 'border-destructive' : ''}
            />
            {errors.nama_pelapor && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.nama_pelapor}</span>
              </div>
            )}
          </div>

          {/* Jenis & Nama Kejahatan - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jenis_kejahatan" className="text-sm font-semibold">
                Jenis Kejahatan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.jenis_kejahatan}
                onValueChange={(value) => handleChange('jenis_kejahatan', value)}
              >
                <SelectTrigger id="jenis_kejahatan" className={errors.jenis_kejahatan ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Pilih jenis kejahatan" />
                </SelectTrigger>
                <SelectContent>
                  {jenisKejahatanList.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nama_jenis_kejahatan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jenis_kejahatan && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.jenis_kejahatan}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_kejahatan" className="text-sm font-semibold">
                Nama Kejahatan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.nama_kejahatan}
                onValueChange={(value) => handleChange('nama_kejahatan', value)}
                disabled={!formData.jenis_kejahatan}
              >
                <SelectTrigger id="nama_kejahatan" className={errors.nama_kejahatan ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Pilih nama kejahatan" />
                </SelectTrigger>
                <SelectContent>
                  {namaKejahatanList.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nama_kejahatan && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.nama_kejahatan}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tanggal & Waktu - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal_kejadian" className="text-sm font-semibold">
                Tanggal Kejadian <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tanggal_kejadian"
                type="date"
                value={formData.tanggal_kejadian}
                onChange={(e) => handleChange('tanggal_kejadian', e.target.value)}
                className={errors.tanggal_kejadian ? 'border-destructive' : ''}
              />
              {errors.tanggal_kejadian && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.tanggal_kejadian}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waktu_kejadian" className="text-sm font-semibold">
                Waktu Kejadian <span className="text-destructive">*</span>
              </Label>
              <Input
                id="waktu_kejadian"
                type="time"
                value={formData.waktu_kejadian}
                onChange={(e) => handleChange('waktu_kejadian', e.target.value)}
                className={errors.waktu_kejadian ? 'border-destructive' : ''}
              />
              {errors.waktu_kejadian && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.waktu_kejadian}</span>
                </div>
              )}
            </div>
          </div>

          {/* Kecamatan & Desa - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kecamatan" className="text-sm font-semibold">
                Kecamatan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.kecamatan}
                onValueChange={(value) => handleChange('kecamatan', value)}
              >
                <SelectTrigger id="kecamatan" className={errors.kecamatan ? 'border-destructive' : ''}>
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
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.kecamatan}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="desa" className="text-sm font-semibold">
                Desa <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.desa}
                onValueChange={(value) => handleChange('desa', value)}
                disabled={!formData.kecamatan}
              >
                <SelectTrigger id="desa" className={errors.desa ? 'border-destructive' : ''}>
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
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.desa}</span>
                </div>
              )}
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <Label htmlFor="alamat" className="text-sm font-semibold">
              Alamat Lengkap <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="alamat"
              placeholder="Masukkan alamat lengkap kejadian"
              value={formData.alamat}
              onChange={(e) => handleChange('alamat', e.target.value)}
              className={errors.alamat ? 'border-destructive' : ''}
              rows={2}
            />
            {errors.alamat && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.alamat}</span>
              </div>
            )}
          </div>

          {/* Map Picker */}
          <MapPicker
            value={{ lat: formData.latitude, lng: formData.longitude }}
            onChange={(location) => {
              handleChange('latitude', location.lat);
              handleChange('longitude', location.lng);
            }}
          />

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi" className="text-sm font-semibold">
              Deskripsi Kejadian <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="deskripsi"
              placeholder="Jelaskan detail kejadian"
              value={formData.deskripsi}
              onChange={(e) => handleChange('deskripsi', e.target.value)}
              className={errors.deskripsi ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.deskripsi && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.deskripsi}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {statusList.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.status}</span>
              </div>
            )}
          </div>

          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Foto Saat Ini</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.file_path}
                      alt={photo.file_name}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => markPhotoForDeletion(photo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{photo.file_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Photos */}
          <div className="space-y-2">
            <Label htmlFor="photos" className="text-sm font-semibold">
              Tambah Foto Baru
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
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
              <span className="text-xs text-muted-foreground">
                {newPhotos.length} foto baru dipilih
              </span>
            </div>
            
            {/* New Photo Previews */}
            {newPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {newPhotos.map((photo, index) => (
                  <div key={index} className="space-y-1">
                    <div className="relative group">
                      <img
                        src={photo.preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewPhoto(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Nama foto"
                      value={photo.fileName}
                      onChange={(e) => updatePhotoFileName(index, e.target.value)}
                      className="text-xs h-7"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
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
            <Button type="submit" className="gap-2" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}