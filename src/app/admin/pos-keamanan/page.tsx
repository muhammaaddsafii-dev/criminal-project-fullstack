"use client";

import { Shield, CheckCircle, XCircle, Users, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { securityPostData, type SecurityPostData } from '@/lib/dashboard/data';

const columns = [
  { key: 'id' as keyof SecurityPostData, label: 'ID' },
  { key: 'namaPos' as keyof SecurityPostData, label: 'Nama Pos' },
  { key: 'lokasi' as keyof SecurityPostData, label: 'Lokasi' },
  { key: 'petugas' as keyof SecurityPostData, label: 'Petugas' },
  {
    key: 'shift' as keyof SecurityPostData,
    label: 'Shift',
    render: (item: SecurityPostData) => <StatusBadge status={item.shift} />,
  },
  {
    key: 'status' as keyof SecurityPostData,
    label: 'Status',
    render: (item: SecurityPostData) => <StatusBadge status={item.status} />,
  },
  { key: 'actions' as const, label: 'Aksi' },
];

export default function PosKeamanan() {
  const totalPosts = securityPostData.length;
  const activePosts = securityPostData.filter((d) => d.status === 'Aktif').length;
  const inactivePosts = securityPostData.filter((d) => d.status === 'Nonaktif').length;
  const morningShift = securityPostData.filter((d) => d.shift === 'Pagi').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Pos Keamanan</h1>
          <p className="text-muted-foreground">Kelola informasi pos dan petugas keamanan</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Pos"
            value={totalPosts}
            icon={Shield}
            variant="primary"
          />
          <StatsCard
            title="Pos Aktif"
            value={activePosts}
            icon={CheckCircle}
            trend={{ value: 3, isPositive: true }}
            variant="success"
          />
          <StatsCard
            title="Pos Nonaktif"
            value={inactivePosts}
            icon={XCircle}
            variant="destructive"
          />
          <StatsCard
            title="Shift Pagi"
            value={morningShift}
            icon={Clock}
            variant="warning"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={securityPostData}
          columns={columns}
          searchKeys={['namaPos', 'lokasi', 'petugas']}
          filterKey="status"
          filterOptions={['Aktif', 'Nonaktif']}
        />
      </div>
    </DashboardLayout>
  );
}
