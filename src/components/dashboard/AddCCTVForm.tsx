"use client";

import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Upload, Trash2 } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapPicker } from '@/components/dashboard/MapPicker';
import {
  getKecamatan,
  getDesa,
  createCCTV,
  type Kecamatan,
  type Desa,
  type CCTV,
} from '@/lib/api/cctv';

interface AddCCTVFormProps {
  onAdd: (data: CCTV) => void;
}

export function AddCCTVForm({ onAdd }: AddCCTVFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Master data
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    nama_lokasi: '',
    kecamatan: '',
    desa: '',
    deskripsi: '',
    url_cctv: '',
    longitude: 110.3695,
    latitude: -7.7956,
  });

  const [photos, setPhotos] = useState<{ file: File; fileName: string; preview: string }[]>([]);

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
    } else {
      setDesaList([]);
      setFormData(prev => ({ ...prev, desa: '' }));
    }
  }, [formData.kecamatan]);

  const loadMasterData = async () => {
    try {
      const kecamatan = await getKecamatan();
      setKecamatanList(kecamatan);
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

    // Create previews and add to photos
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => [...prev, {
          file,
          fileName: file.name.split('.')[0],
          preview: e.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const updatePhotoFileName = (index: number, fileName: string) => {
    setPhotos(prev => prev.map((photo, i) =>
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
      const data = {
        nama_lokasi: formData.nama_lokasi,
        kecamatan: parseInt(formData.kecamatan),
        desa: parseInt(formData.desa),
        deskripsi: formData.deskripsi,
        url_cctv: formData.url_cctv,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const result = await createCCTV(data, photos);
      onAdd(result);

      // Reset form
      resetForm();
      setOpen(false);
      alert('Data berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error creating CCTV:', error);
      alert(`Gagal menambahkan data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_lokasi: '',
      kecamatan: '',
      desa: '',
      deskripsi: '',
      url_cctv: '',
      longitude: 110.3695,
      latitude: -7.7956,
    });
    setPhotos([]);
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Data CCTV</DialogTitle>
          <DialogDescription>
            Masukkan informasi CCTV yang ingin ditambahkan ke sistem
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
              placeholder="Contoh: CCTV Perempatan Terban"
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
            {/* Kecamatan */}
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

            {/* Desa */}
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
            <Label htmlFor="url_cctv">URL CCTV (Opsional)</Label>
            <Input
              id="url_cctv"
              type="url"
              value={formData.url_cctv}
              onChange={(e) => handleChange('url_cctv', e.target.value)}
              placeholder="https://cctv.example.com/stream/..."
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleChange('deskripsi', e.target.value)}
              placeholder="Deskripsi CCTV..."
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

          {/* Upload Photos */}
          <div className="space-y-2">
            <Label>Foto CCTV (Opsional)</Label>
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
            {photos.length > 0 && (
              <p className="text-sm text-muted-foreground">{photos.length} foto dipilih</p>
            )}
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo, index) => (
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
                    onClick={() => removePhoto(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Input
                    value={photo.fileName}
                    onChange={(e) => updatePhotoFileName(index, e.target.value)}
                    placeholder="Nama foto"
                    className="text-xs h-7"
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Data'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
