// src/components/dashboard/ViewDesaDetail.tsx
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
import { type Desa } from '@/lib/api/desa';

interface ViewDesaDetailProps {
  data: Desa;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewDesaDetail({ data, open, onOpenChange }: ViewDesaDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Desa</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang desa
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">ID:</div>
            <div className="col-span-2 text-muted-foreground">{data.id}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Nama Desa:</div>
            <div className="col-span-2 text-muted-foreground">{data.nama}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Kecamatan:</div>
            <div className="col-span-2 text-muted-foreground">{data.kecamatan_nama}</div>
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