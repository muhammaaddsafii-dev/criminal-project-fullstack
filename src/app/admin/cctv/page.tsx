"use client";

import { Video, CheckCircle, XCircle, Wrench, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { cctvData, type CCTVData } from '@/lib/dashboard/data';

const columns = [
  { key: 'id' as keyof CCTVData, label: 'ID' },
  { key: 'lokasiCCTV' as keyof CCTVData, label: 'Lokasi CCTV' },
  {
    key: 'status' as keyof CCTVData,
    label: 'Status',
    render: (item: CCTVData) => <StatusBadge status={item.status} />,
  },
  { key: 'zona' as keyof CCTVData, label: 'Zona' },
  { key: 'terakhirDiperbarui' as keyof CCTVData, label: 'Terakhir Diperbarui' },
  { key: 'actions' as const, label: 'Aksi' },
];

export default function CCTV() {
  const totalCCTV = cctvData.length;
  const activeCCTV = cctvData.filter((d) => d.status === 'Aktif').length;
  const inactiveCCTV = cctvData.filter((d) => d.status === 'Nonaktif').length;
  const maintenanceCCTV = cctvData.filter((d) => d.status === 'Maintenance').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data CCTV</h1>
          <p className="text-muted-foreground">Pantau status dan lokasi kamera pengawas</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total CCTV"
            value={totalCCTV}
            icon={Video}
            variant="primary"
          />
          <StatsCard
            title="CCTV Aktif"
            value={activeCCTV}
            icon={CheckCircle}
            trend={{ value: 5, isPositive: true }}
            variant="success"
          />
          <StatsCard
            title="CCTV Nonaktif"
            value={inactiveCCTV}
            icon={XCircle}
            variant="destructive"
          />
          <StatsCard
            title="Dalam Maintenance"
            value={maintenanceCCTV}
            icon={Wrench}
            variant="warning"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={cctvData}
          columns={columns}
          searchKeys={['lokasiCCTV', 'zona']}
          filterKey="status"
          filterOptions={['Aktif', 'Nonaktif', 'Maintenance']}
        />
      </div>
    </DashboardLayout>
  );
}
