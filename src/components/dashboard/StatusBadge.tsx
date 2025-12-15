"use client";

import { cn } from '@/lib/utils';

type StatusType = 
  | 'Aktif' | 'Nonaktif' | 'Maintenance' | 'Pending'
  | 'Selesai' | 'Proses'
  | 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis'
  | 'Pagi' | 'Siang' | 'Malam'
  | 'Admin' | 'Operator' | 'Viewer';

const statusStyles: Record<StatusType, string> = {
  Aktif: 'bg-success/10 text-success border-success/20',
  Nonaktif: 'bg-muted text-muted-foreground border-muted-foreground/20',
  Maintenance: 'bg-warning/10 text-warning border-warning/20',
  Pending: 'bg-info/10 text-info border-info/20',
  Selesai: 'bg-success/10 text-success border-success/20',
  Proses: 'bg-info/10 text-info border-info/20',
  Rendah: 'bg-success/10 text-success border-success/20',
  Sedang: 'bg-warning/10 text-warning border-warning/20',
  Tinggi: 'bg-destructive/10 text-destructive border-destructive/20',
  Kritis: 'bg-destructive text-destructive-foreground border-destructive',
  Pagi: 'bg-warning/10 text-warning border-warning/20',
  Siang: 'bg-info/10 text-info border-info/20',
  Malam: 'bg-primary/10 text-primary border-primary/20',
  Admin: 'bg-primary/10 text-primary border-primary/20',
  Operator: 'bg-info/10 text-info border-info/20',
  Viewer: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status as StatusType] || 'bg-muted text-muted-foreground border-muted-foreground/20';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        style
      )}
    >
      {status}
    </span>
  );
}
