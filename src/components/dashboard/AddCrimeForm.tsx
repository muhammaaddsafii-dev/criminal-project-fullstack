"use client";

import { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { CrimeData } from '@/lib/dashboard/data';

interface AddCrimeFormProps {
  onAdd: (data: CrimeData) => void;
}

export function AddCrimeForm({ onAdd }: AddCrimeFormProps) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<CrimeData>>({
    jenisKejadian: '',
    lokasi: '',
    tanggal: '',
    status: 'Pending',
    tingkatBahaya: 'Rendah',
  });

  const handleChange = (field: keyof CrimeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.jenisKejadian?.trim()) {
      newErrors.jenisKejadian = 'Jenis kejadian harus diisi';
    }
    if (!formData.lokasi?.trim()) {
      newErrors.lokasi = 'Lokasi harus diisi';
    }
    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Generate ID (dalam production, ini dari backend)
    const newId = `KRM${String(Math.floor(Math.random() * 9000) + 1000).padStart(3, '0')}`;
    
    const newCrimeData: CrimeData = {
      id: newId,
      jenisKejadian: formData.jenisKejadian!,
      lokasi: formData.lokasi!,
      tanggal: formData.tanggal!,
      status: formData.status as 'Selesai' | 'Proses' | 'Pending',
      tingkatBahaya: formData.tingkatBahaya as 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis',
    };

    onAdd(newCrimeData);
    
    // Reset form
    setFormData({
      jenisKejadian: '',
      lokasi: '',
      tanggal: '',
      status: 'Pending',
      tingkatBahaya: 'Rendah',
    });
    setErrors({});
    setOpen(false);
  };

  const handleCancel = () => {
    setFormData({
      jenisKejadian: '',
      lokasi: '',
      tanggal: '',
      status: 'Pending',
      tingkatBahaya: 'Rendah',
    });
    setErrors({});
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tambah Data Kriminalitas</DialogTitle>
          <DialogDescription>
            Masukkan informasi kejadian kriminal yang ingin ditambahkan ke sistem
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Jenis Kejadian */}
          <div className="space-y-2">
            <Label htmlFor="jenisKejadian" className="text-sm font-semibold">
              Jenis Kejadian <span className="text-destructive">*</span>
            </Label>
            <Input
              id="jenisKejadian"
              placeholder="Contoh: Pencurian Kendaraan"
              value={formData.jenisKejadian}
              onChange={(e) => handleChange('jenisKejadian', e.target.value)}
              className={errors.jenisKejadian ? 'border-destructive' : ''}
            />
            {errors.jenisKejadian && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.jenisKejadian}</span>
              </div>
            )}
          </div>

          {/* Lokasi */}
          <div className="space-y-2">
            <Label htmlFor="lokasi" className="text-sm font-semibold">
              Lokasi Kejadian <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lokasi"
              placeholder="Contoh: Jl. Sudirman No. 45, Jakarta Pusat"
              value={formData.lokasi}
              onChange={(e) => handleChange('lokasi', e.target.value)}
              className={errors.lokasi ? 'border-destructive' : ''}
            />
            {errors.lokasi && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.lokasi}</span>
              </div>
            )}
          </div>

          {/* Tanggal */}
          <div className="space-y-2">
            <Label htmlFor="tanggal" className="text-sm font-semibold">
              Tanggal Kejadian <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tanggal"
              type="date"
              value={formData.tanggal}
              onChange={(e) => {
                // Convert from YYYY-MM-DD to DD/MM/YYYY for display
                const date = new Date(e.target.value);
                const formattedDate = date.toLocaleDateString('id-ID');
                handleChange('tanggal', formattedDate);
              }}
              className={errors.tanggal ? 'border-destructive' : ''}
            />
            {errors.tanggal && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.tanggal}</span>
              </div>
            )}
          </div>

          {/* Status & Tingkat Bahaya - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Proses">Proses</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tingkat Bahaya */}
            <div className="space-y-2">
              <Label htmlFor="tingkatBahaya" className="text-sm font-semibold">
                Tingkat Bahaya
              </Label>
              <Select
                value={formData.tingkatBahaya}
                onValueChange={(value) => handleChange('tingkatBahaya', value)}
              >
                <SelectTrigger id="tingkatBahaya">
                  <SelectValue placeholder="Pilih tingkat bahaya" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rendah">Rendah</SelectItem>
                  <SelectItem value="Sedang">Sedang</SelectItem>
                  <SelectItem value="Tinggi">Tinggi</SelectItem>
                  <SelectItem value="Kritis">Kritis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Simpan Data
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}