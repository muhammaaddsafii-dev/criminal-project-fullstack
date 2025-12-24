// src/components/dashboard/ViewKecamatanDetail.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type Kecamatan } from '@/lib/api/kecamatan';

interface ViewKecamatanDetailProps {
  data: Kecamatan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewKecamatanDetail({ data, open, onOpenChange }: ViewKecamatanDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Kecamatan</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang kecamatan
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">ID:</div>
            <div className="col-span-2 text-muted-foreground">{data.id}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Nama Kecamatan:</div>
            <div className="col-span-2 text-muted-foreground">{data.nama}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Deskripsi:</div>
            <div className="col-span-2 text-muted-foreground">
              {data.deskripsi || '-'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Tanggal Dibuat:</div>
            <div className="col-span-2 text-muted-foreground">
              {new Date(data.created_at).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Terakhir Diperbarui:</div>
            <div className="col-span-2 text-muted-foreground">
              {new Date(data.updated_at).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}