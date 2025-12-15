// src/app/kriminalitas/page.tsx
'use client';

import { FileWarning, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { crimeData, type CrimeData } from '@/lib/dashboard/data';

const columns = [
  { key: 'id' as keyof CrimeData, label: 'ID' },
  { key: 'jenisKejadian' as keyof CrimeData, label: 'Jenis Kejadian' },
  { key: 'lokasi' as keyof CrimeData, label: 'Lokasi' },
  { key: 'tanggal' as keyof CrimeData, label: 'Tanggal' },
  {
    key: 'status' as keyof CrimeData,
    label: 'Status',
    render: (item: CrimeData) => <StatusBadge status={item.status} />,
  },
  {
    key: 'tingkatBahaya' as keyof CrimeData,
    label: 'Tingkat Bahaya',
    render: (item: CrimeData) => <StatusBadge status={item.tingkatBahaya} />,
  },
  { key: 'actions' as const, label: 'Aksi' },
];

export default function KriminalitasPage() {
  const totalCases = crimeData.length;
  const completedCases = crimeData.filter((d) => d.status === 'Selesai').length;
  const inProgressCases = crimeData.filter((d) => d.status === 'Proses').length;
  const criticalCases = crimeData.filter((d) => d.tingkatBahaya === 'Kritis' || d.tingkatBahaya === 'Tinggi').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Kriminalitas</h1>
          <p className="text-muted-foreground">Kelola dan pantau data kejadian kriminal</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Kasus"
            value={totalCases}
            icon={FileWarning}
            trend={{ value: 12, isPositive: false }}
            variant="primary"
          />
          <StatsCard
            title="Kasus Selesai"
            value={completedCases}
            icon={CheckCircle}
            trend={{ value: 8, isPositive: true }}
            variant="success"
          />
          <StatsCard
            title="Dalam Proses"
            value={inProgressCases}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Tingkat Tinggi/Kritis"
            value={criticalCases}
            icon={AlertTriangle}
            variant="destructive"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={crimeData}
          columns={columns}
          searchKeys={['jenisKejadian', 'lokasi']}
          filterKey="status"
          filterOptions={['Selesai', 'Proses', 'Pending']}
        />
      </div>
    </DashboardLayout>
  );
}