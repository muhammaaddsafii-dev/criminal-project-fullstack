// src/app/kriminalitas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileWarning, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { AddCrimeForm } from '@/components/dashboard/AddCrimeForm';
import { EditCrimeForm } from '@/components/dashboard/EditCrimeForm';
import { ViewCrimeDetail } from '@/components/dashboard/ViewCrimeDetail';
import {
  getLaporanKejahatan,
  deleteLaporanKejahatan,
  type LaporanKejahatan,
} from '@/lib/api/crime';

// Transformed interface for display
interface CrimeData {
  id: string;
  jenisKejadian: string;
  lokasi: string;
  tanggal: string;
  status: 'Selesai' | 'Proses' | 'Pending';
  tingkatBahaya: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  rawData: LaporanKejahatan;
}

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

// Helper function to map status
const mapStatus = (statusNama: string): 'Selesai' | 'Proses' | 'Pending' => {
  const statusMap: Record<string, 'Selesai' | 'Proses' | 'Pending'> = {
    'Selesai': 'Selesai',
    'Ditutup': 'Selesai',
    'Proses': 'Proses',
    'Dalam Proses': 'Proses',
    'Sedang Ditangani': 'Proses',
    'Dilaporkan': 'Pending',
    'Pending': 'Pending',
  };
  return statusMap[statusNama] || 'Pending';
};

// Helper function to determine danger level based on crime type
const getDangerLevel = (jenisKejahatan: string): 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis' => {
  const dangerMap: Record<string, 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis'> = {
    'Kejahatan Kekerasan': 'Kritis',
    'Pembunuhan': 'Kritis',
    'Kejahatan Seksual': 'Kritis',
    'Pencurian': 'Tinggi',
    'Perampokan': 'Tinggi',
    'Penipuan': 'Sedang',
    'Kejahatan Siber': 'Sedang',
    'Vandalisme': 'Rendah',
    'Gangguan Ketertiban': 'Rendah',
  };
  return dangerMap[jenisKejahatan] || 'Sedang';
};

// Transform API data to display format
const transformLaporanToDisplay = (laporan: LaporanKejahatan): CrimeData => {
  return {
    id: `KRM${laporan.id.toString().padStart(3, '0')}`,
    jenisKejadian: laporan.nama_kejahatan_nama,
    lokasi: `${laporan.desa_nama}, ${laporan.kecamatan_nama}`,
    tanggal: new Date(laporan.tanggal_kejadian).toLocaleDateString('id-ID'),
    status: mapStatus(laporan.status_nama),
    tingkatBahaya: getDangerLevel(laporan.jenis_kejahatan_nama),
    rawData: laporan,
  };
};

export default function KriminalitasPage() {
  const [crimeData, setCrimeData] = useState<CrimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState<LaporanKejahatan | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewData, setSelectedViewData] = useState<LaporanKejahatan | null>(null);

  // Stats
  const totalCases = crimeData.length;
  const completedCases = crimeData.filter((d) => d.status === 'Selesai').length;
  const inProgressCases = crimeData.filter((d) => d.status === 'Proses').length;
  const criticalCases = crimeData.filter((d) => d.tingkatBahaya === 'Kritis' || d.tingkatBahaya === 'Tinggi').length;

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLaporanKejahatan();
      const transformedData = response.results.map(transformLaporanToDisplay);
      setCrimeData(transformedData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (newLaporan: LaporanKejahatan) => {
    const newData = transformLaporanToDisplay(newLaporan);
    setCrimeData(prevData => [newData, ...prevData]);
  };

  const handleView = (item: CrimeData) => {
    setSelectedViewData(item.rawData);
    setViewDialogOpen(true);
  };

  const handleEdit = (item: CrimeData) => {
    setSelectedEditData(item.rawData);
    setEditDialogOpen(true);
  };

  const handleUpdate = (updatedLaporan: LaporanKejahatan) => {
    const updatedData = transformLaporanToDisplay(updatedLaporan);
    setCrimeData(prevData => 
      prevData.map(item => 
        item.id === updatedData.id ? updatedData : item
      )
    );
  };

  const handleDelete = async (id: string) => {
    try {
      // Extract numeric ID from KRMxxx format
      const numericId = parseInt(id.replace('KRM', ''));
      
      // Confirm delete
      if (!confirm(`Apakah Anda yakin ingin menghapus data dengan ID ${id}?`)) {
        return;
      }

      await deleteLaporanKejahatan(numericId);
      
      // Update state
      setCrimeData(prevData => prevData.filter(item => item.id !== id));
      
      alert(`Data dengan ID ${id} berhasil dihapus!`);
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert(`Gagal menghapus data: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <p className="mt-4 text-destructive">{error}</p>
            <button 
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

        {/* Edit Dialog */}
        {selectedEditData && (
          <EditCrimeForm
            data={selectedEditData}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdate={handleUpdate}
          />
        )}

        {/* View Dialog */}
        {selectedViewData && (
          <ViewCrimeDetail
            data={selectedViewData}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
}