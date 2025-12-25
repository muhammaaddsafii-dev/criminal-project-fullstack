//src/components/dashboard/AddSecurityPostForm.tsx
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
  getDesa,
  createPosKeamanan,
  type Desa,
  type PosKeamanan,
} from '@/lib/api/securityPost';

interface AddSecurityPostFormProps {
  onAdd: (data: PosKeamanan) => void;
}

export function AddSecurityPostForm({ onAdd }: AddSecurityPostFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Master data
  const [desaList, setDesaList] = useState<Desa[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    nama: '',
    desa: '',
    alamat: '',
    keterangan: '',
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

  const loadMasterData = async () => {
    try {
      const desaData = await getDesa();
      setDesaList(desaData);
    } catch (error) {
      console.error('Error loading master data:', error);
      alert('Gagal memuat data desa');
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

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama pos keamanan harus diisi';
    }
    if (!formData.desa) {
      newErrors.desa = 'Desa harus dipilih';
    }
    if (!formData.alamat.trim()) {
      newErrors.alamat = 'Alamat harus diisi';
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
        nama: formData.nama,
        desa: parseInt(formData.desa),
        alamat: formData.alamat,
        keterangan: formData.keterangan || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const result = await createPosKeamanan(data, photos);
      onAdd(result);
      
      // Reset form
      resetForm();
      setOpen(false);
      alert('Data berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error creating pos keamanan:', error);
      alert(`Gagal menambahkan data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      desa: '',
      alamat: '',
      keterangan: '',
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pos Keamanan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tambah Pos Keamanan</DialogTitle>
          <DialogDescription>
            Masukkan informasi pos keamanan yang ingin ditambahkan ke sistem
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Pos Keamanan */}
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-sm font-semibold">
              Nama Pos Keamanan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nama"
              placeholder="Masukkan nama pos keamanan"
              value={formData.nama}
              onChange={(e) => handleChange('nama', e.target.value)}
              className={errors.nama ? 'border-destructive' : ''}
            />
            {errors.nama && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.nama}</span>
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
            >
              <SelectTrigger id="desa" className={errors.desa ? 'border-destructive' : ''}>
                <SelectValue placeholder="Pilih desa" />
              </SelectTrigger>
              <SelectContent>
                {desaList.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.nama} ({item.kecamatan_nama})
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

          {/* Alamat */}
          <div className="space-y-2">
            <Label htmlFor="alamat" className="text-sm font-semibold">
              Alamat Lengkap <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="alamat"
              placeholder="Masukkan alamat lengkap pos keamanan"
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

          {/* Keterangan */}
          <div className="space-y-2">
            <Label htmlFor="keterangan" className="text-sm font-semibold">
              Keterangan (Opsional)
            </Label>
            <Textarea
              id="keterangan"
              placeholder="Masukkan keterangan tambahan"
              value={formData.keterangan}
              onChange={(e) => handleChange('keterangan', e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload Photos */}
          <div className="space-y-2">
            <Label htmlFor="photos" className="text-sm font-semibold">
              Foto Pos Keamanan
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
              <Plus className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan Data'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}