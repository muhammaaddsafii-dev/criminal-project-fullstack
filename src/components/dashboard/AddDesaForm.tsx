// src/components/dashboard/AddDesaForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
  createDesa,
  type Desa,
} from '@/lib/api/desa';
import { getKecamatan, type Kecamatan } from '@/lib/api/kecamatan';

interface AddDesaFormProps {
  onAdd: (newDesa: Desa) => void;
}

export function AddDesaForm({ onAdd }: AddDesaFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    kecamatan: '',
  });

  useEffect(() => {
    if (open) {
      loadKecamatan();
    }
  }, [open]);

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
      alert('Gagal memuat data kecamatan');
    } finally {
      setLoadingKecamatan(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kecamatan) {
      alert('Pilih kecamatan terlebih dahulu');
      return;
    }
    
    try {
      setLoading(true);
      
      const newDesa = await createDesa({
        nama: formData.nama,
        deskripsi: formData.deskripsi || undefined,
        kecamatan: parseInt(formData.kecamatan),
      });
      
      onAdd(newDesa);
      setOpen(false);
      
      // Reset form
      setFormData({
        nama: '',
        deskripsi: '',
        kecamatan: '',
      });
      
      alert('Data desa berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error creating desa:', error);
      alert(`Gagal menambahkan data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Desa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Data Desa</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah untuk menambahkan data desa baru
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
              placeholder="Contoh: Karangwaru"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Deskripsi singkat tentang desa..."
              rows={4}
            />
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
            <Button type="submit" disabled={loading || loadingKecamatan}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}