"use client";

import { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertCircle, Upload, Trash2, Save } from 'lucide-react';
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
  getJenisKejahatan,
  getNamaKejahatan,
  getKecamatan,
  getDesa,
  getStatus,
  createLaporanKejahatan,
  type JenisKejahatan,
  type NamaKejahatan,
  type Kecamatan,
  type Desa,
  type Status,
  type LaporanKejahatan,
} from '@/lib/api/crime';

interface AddCrimeFormProps {
  onAdd: (data: LaporanKejahatan) => void;
}

export function AddCrimeForm({ onAdd }: AddCrimeFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Master data
  const [jenisKejahatanList, setJenisKejahatanList] = useState<JenisKejahatan[]>([]);
  const [namaKejahatanList, setNamaKejahatanList] = useState<NamaKejahatan[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    nama_pelapor: '',
    jenis_kejahatan: '',
    nama_kejahatan: '',
    tanggal_kejadian: '',
    waktu_kejadian: '',
    kecamatan: '',
    desa: '',
    alamat: '',
    deskripsi: '',
    status: '',
    longitude: -7.7956,
    latitude: 110.3695,
  });
  
  const [photos, setPhotos] = useState<{ file: File; fileName: string; preview: string }[]>([]);

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
    } else {
      setNamaKejahatanList([]);
      setFormData(prev => ({ ...prev, nama_kejahatan: '' }));
    }
  }, [formData.jenis_kejahatan]);

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
      const [jenis, kecamatan, status] = await Promise.all([
        getJenisKejahatan(),
        getKecamatan(),
        getStatus(),
      ]);
      
      setJenisKejahatanList(jenis);
      setKecamatanList(kecamatan);
      setStatusList(status);
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

    // Create previews and add to photos
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => [...prev, {
          file,
          fileName: file.name.split('.')[0], // filename without extension
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
      const data = {
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

      const result = await createLaporanKejahatan(data, photos);
      onAdd(result);
      
      // Reset form
      resetForm();
      setOpen(false);
      alert('Data berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error creating laporan:', error);
      alert(`Gagal menambahkan data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_pelapor: '',
      jenis_kejahatan: '',
      nama_kejahatan: '',
      tanggal_kejadian: '',
      waktu_kejadian: '',
      kecamatan: '',
      desa: '',
      alamat: '',
      deskripsi: '',
      status: '',
      longitude: -7.7956,
      latitude: 110.3695,
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
        <Button className="gap-1 sm:gap-1.5 md:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
          <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
          <span className="hidden xs:inline sm:hidden">Crime</span>
          <span className="hidden sm:inline">Kriminalitas</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tambah Data Kriminalitas</DialogTitle>
          <DialogDescription>
            Masukkan informasi kejadian kriminal yang ingin ditambahkan ke sistem
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
            {/* Jenis Kejahatan */}
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

            {/* Nama Kejahatan */}
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
            {/* Tanggal */}
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

            {/* Waktu */}
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
            {/* Kecamatan */}
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

            {/* Desa */}
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

          {/* Upload Photos */}
          <div className="space-y-2">
            <Label htmlFor="photos" className="text-sm font-semibold">
              Foto Kejadian
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
                {photos.length} foto dipilih
              </span>
            </div>
            
            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="space-y-1">
                    <div className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
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
              onClick={handleCancel}
              className="gap-2"
              disabled={loading}
            >
              <X className="h-4 w-4" />
              Batal
            </Button>
            <Button type="submit" className="gap-2" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan Data'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}