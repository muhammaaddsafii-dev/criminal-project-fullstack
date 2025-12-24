// src/components/dashboard/EditKecamatanForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  updateKecamatan,
  type Kecamatan,
} from '@/lib/api/kecamatan';

interface EditKecamatanFormProps {
  data: Kecamatan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedKecamatan: Kecamatan) => void;
}

export function EditKecamatanForm({ data, open, onOpenChange, onUpdate }: EditKecamatanFormProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: data.nama,
    deskripsi: data.deskripsi || '',
  });

  useEffect(() => {
    setFormData({
      nama: data.nama,
      deskripsi: data.deskripsi || '',
    });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const updatedKecamatan = await updateKecamatan(data.id, {
        nama: formData.nama,
        deskripsi: formData.deskripsi || undefined,
      });
      
      onUpdate(updatedKecamatan);
      onOpenChange(false);
      
      alert('Data kecamatan berhasil diperbarui!');
    } catch (error: any) {
      console.error('Error updating kecamatan:', error);
      alert(`Gagal memperbarui data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Kecamatan</DialogTitle>
          <DialogDescription>
            Ubah informasi kecamatan di bawah ini
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kecamatan *</Label>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}