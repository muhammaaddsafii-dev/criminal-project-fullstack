// src/components/dashboard/AddKejadianLainnyaForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Upload, X, Save } from 'lucide-react';
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
import {
  createKejadianLainnya,
  type KejadianLainnya,
} from '@/lib/api/kejadian-lainnya';
import { getKecamatan, type Kecamatan } from '@/lib/api/kecamatan';
import { getDesa, type Desa } from '@/lib/api/desa';
import { getStatus, type Status } from '@/lib/api/crime';
import { MapPicker } from '@/components/dashboard/MapPicker';

interface AddOtherCrimeFormProps {
  onAdd: (newKejadian: KejadianLainnya) => void;
}

export function AddOtherCrimeForm({ onAdd }: AddOtherCrimeFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [photos, setPhotos] = useState<{ file: File; preview: string; fileName: string }[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();

  const [formData, setFormData] = useState({
    nama_pelapor: '',
    nama_kejadian: '',
    deskripsi_kejadian: '',
    tanggal_kejadian: '',
    waktu_kejadian: '',
    kecamatan: '',
    desa: '',
    status: '',
  });

  useEffect(() => {
    if (open) {
      loadMasterData();
    }
  }, [open]);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      fileName: file.name,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const dataToSubmit: any = {
        nama_pelapor: formData.nama_pelapor,
        nama_kejadian: formData.nama_kejadian,
        deskripsi_kejadian: formData.deskripsi_kejadian,
        tanggal_kejadian: formData.tanggal_kejadian,
        waktu_kejadian: formData.waktu_kejadian,
        kecamatan: parseInt(formData.kecamatan),
        desa: parseInt(formData.desa),
        status: parseInt(formData.status),
      };

      if (location) {
        dataToSubmit.longitude = location.lng;
        dataToSubmit.latitude = location.lat;
      }
      
      const newKejadian = await createKejadianLainnya(
        dataToSubmit,
        photos.map(p => ({ file: p.file, fileName: p.fileName }))
      );
      
      onAdd(newKejadian);
      setOpen(false);
      
      // Reset form
      setFormData({
        nama_pelapor: '',
        nama_kejadian: '',
        deskripsi_kejadian: '',
        tanggal_kejadian: '',
        waktu_kejadian: '',
        kecamatan: '',
        desa: '',
        status: '',
      });
      setPhotos([]);
      setLocation(undefined);
      
      alert('Data kejadian berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error creating kejadian:', error);
      alert(`Gagal menambahkan data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 sm:gap-1.5 md:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
          <span className="hidden xs:inline sm:hidden">Kejadian</span>
          <span className="hidden sm:inline">Tambah Kejadian</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Data Kejadian Lainnya</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah untuk menambahkan data kejadian lainnya
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
              onValueChange={(value) => setFormData({ ...formData, kecamatan: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kecamatan" />
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
              disabled={!formData.kecamatan}
            >
              <SelectTrigger>
                <SelectValue placeholder={!formData.kecamatan ? "Pilih kecamatan dulu" : "Pilih Desa"} />
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
                <SelectValue placeholder="Pilih Status" />
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

          {/* Map Picker for Location */}
          <MapPicker
            value={location}
            onChange={setLocation}
          />

          <div className="space-y-2">
            <Label>Foto</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Foto
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}