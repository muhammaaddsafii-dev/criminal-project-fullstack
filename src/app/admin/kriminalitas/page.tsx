// src/app/kriminalitas/page.tsx
'use client';

import { useState } from 'react';
import { FileWarning, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { AddCrimeForm } from '@/components/dashboard/AddCrimeForm';
import { crimeData as initialCrimeData, type CrimeData } from '@/lib/dashboard/data';
import { useToast } from '../../../hooks/dashboard/use-toast';

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
  const [crimeData, setCrimeData] = useState(initialCrimeData);
  // const { toast } = useToast(); // Uncomment jika sudah ada toast component

  const totalCases = crimeData.length;
  const completedCases = crimeData.filter((d) => d.status === 'Selesai').length;
  const inProgressCases = crimeData.filter((d) => d.status === 'Proses').length;
  const criticalCases = crimeData.filter((d) => d.tingkatBahaya === 'Kritis' || d.tingkatBahaya === 'Tinggi').length;

  const handleAdd = (newData: CrimeData) => {
    setCrimeData(prevData => [newData, ...prevData]);
    
    // Uncomment untuk menampilkan toast notification
    // toast({
    //   title: "Data berhasil ditambahkan",
    //   description: `Data ${newData.jenisKejadian} telah ditambahkan ke sistem.`,
    //   variant: "default",
    // });

    // Sementara gunakan alert
    alert(`Data ${newData.jenisKejadian} berhasil ditambahkan! (Demo - refresh halaman untuk reset data)`);
  };

  const handleView = (item: CrimeData) => {
    console.log('Viewing item:', item);
    // Bisa tambahkan logic tambahan di sini
  };

  const handleEdit = (item: CrimeData) => {
    console.log('Editing item:', item);
    // Bisa tambahkan logic tambahan di sini
    // Misalnya: navigate ke halaman edit atau buka modal edit
  };

  const handleDelete = (id: string) => {
    console.log('Deleting item with ID:', id);
    
    // Update state untuk remove item
    setCrimeData(prevData => prevData.filter(item => item.id !== id));
    
    // Uncomment untuk menampilkan toast notification
    // toast({
    //   title: "Data berhasil dihapus",
    //   description: `Data dengan ID ${id} telah dihapus dari sistem.`,
    //   variant: "default",
    // });

    // Sementara gunakan alert
    alert(`Data dengan ID ${id} berhasil dihapus! (Demo - refresh halaman untuk reset data)`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Kriminalitas</h1>
            <p className="text-muted-foreground">Kelola dan pantau data kejadian kriminal</p>
          </div>
          <AddCrimeForm onAdd={handleAdd} />
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
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}