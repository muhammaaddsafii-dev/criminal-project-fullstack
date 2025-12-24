// src/components/dashboard/ViewKejadianLainnyaDetail.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type KejadianLainnya } from '@/lib/api/kejadian-lainnya';

interface ViewKejadianLainnyaDetailProps {
  data: KejadianLainnya;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewKejadianLainnyaDetail({ data, open, onOpenChange }: ViewKejadianLainnyaDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Kejadian Lainnya</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang kejadian
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">ID:</div>
            <div className="col-span-2 text-muted-foreground">{data.id}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Nama Pelapor:</div>
            <div className="col-span-2 text-muted-foreground">{data.nama_pelapor}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Nama Kejadian:</div>
            <div className="col-span-2 text-muted-foreground">{data.nama_kejadian}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Deskripsi:</div>
            <div className="col-span-2 text-muted-foreground whitespace-pre-wrap">
              {data.deskripsi_kejadian}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Tanggal Kejadian:</div>
            <div className="col-span-2 text-muted-foreground">
              {new Date(data.tanggal_kejadian).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Waktu Kejadian:</div>
            <div className="col-span-2 text-muted-foreground">{data.waktu_kejadian}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Lokasi:</div>
            <div className="col-span-2 text-muted-foreground">
              {data.desa_nama}, {data.kecamatan_nama}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Status:</div>
            <div className="col-span-2">
              <Badge variant={data.status_nama === 'Selesai' ? 'default' : 'secondary'}>
                {data.status_nama}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Status Approval:</div>
            <div className="col-span-2">
              <Badge variant={data.is_approval ? 'default' : 'destructive'}>
                {data.is_approval ? 'Disetujui' : 'Belum Disetujui'}
              </Badge>
            </div>
          </div>

          {data.foto && data.foto.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-foreground">Foto:</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.foto.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={photo.file_path}
                      alt={photo.file_name}
                      className="w-full h-32 object-cover rounded border border-border hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 py-3 border-b border-border">
            <div className="font-semibold text-foreground">Tanggal Laporan:</div>
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