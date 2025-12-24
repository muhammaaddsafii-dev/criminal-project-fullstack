// src/components/dashboard/EditDesaForm.tsx
'use client';

import { useState, useEffect } from 'react';
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
import {
  updateDesa,
  type Desa,
} from '@/lib/api/desa';
import { getKecamatan, type Kecamatan } from '@/lib/api/kecamatan';

interface EditDesaFormProps {
  data: Desa;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedDesa: Desa) => void;
}

export function EditDesaForm({ data, open, onOpenChange, onUpdate }: EditDesaFormProps) {
  const [loading, setLoading] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: data.nama,
    deskripsi: data.deskripsi || '',
    kecamatan: data.kecamatan.toString(),
  });

  useEffect(() => {
    if (open) {
      loadKecamatan();
      setFormData({
        nama: data.nama,
        deskripsi: data.deskripsi || '',
        kecamatan: data.kecamatan.toString(),
      });
    }
  }, [data, open]);

  const loadKecamatan = async () => {
    try {
      setLoadingKecamatan(true);
      
      // Fetch all kecamatan (without pagination limit)
      const firstResponse = await getKecamatan({});
      const allKecamatan: Kecamatan[] = [...firstResponse.results];
      
      // If there are more pages, fetch them all
      let currentPage = 1;
      let hasMore = firstResponse.next !== null;
      
      while (hasMore) {
        currentPage++;
        const nextResponse = await getKecamatan({ page: currentPage });
        allKecamatan.push(...nextResponse.results);
        hasMore = nextResponse.next !== null;
      }
      
      setKecamatanList(allKecamatan);
    } catch (error) {
      console.error('Error loading kecamatan:', error);
    } finally {
      setLoadingKecamatan(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const updatedDesa = await updateDesa(data.id, {
        nama: formData.nama,
        deskripsi: formData.deskripsi || undefined,
        kecamatan: parseInt(formData.kecamatan),
      });
      
      onUpdate(updatedDesa);
      onOpenChange(false);
      
      alert('Data desa berhasil diperbarui!');
    } catch (error: any) {
      console.error('Error updating desa:', error);
      alert(`Gagal memperbarui data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Desa</DialogTitle>
          <DialogDescription>
            Ubah informasi desa di bawah ini
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kecamatan">Kecamatan *</Label>
            <Select
              value={formData.kecamatan}
              onValueChange={(value) => setFormData({ ...formData, kecamatan: value })}
              disabled={loadingKecamatan}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingKecamatan ? "Memuat..." : "Pilih Kecamatan"} />
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
            <Label htmlFor="nama">Nama Desa *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              rows={4}
            />
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
            <Button type="submit" disabled={loading || loadingKecamatan}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}