// src/app/kriminalitas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileWarning, AlertTriangle, CheckCircle, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  isApproval: boolean;
  tingkatBahaya: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  rawData: LaporanKejahatan;
}

const columns = [
  { key: 'id' as keyof CrimeData, label: 'ID' },
  { key: 'jenisKejadian' as keyof CrimeData, label: 'Jenis Kejadian' },
  { key: 'lokasi' as keyof CrimeData, label: 'Lokasi' },
  { key: 'tanggal' as keyof CrimeData, label: 'Tanggal' },
  {
    key: 'isApproval' as keyof CrimeData,
    label: 'Status Approval',
    render: (item: CrimeData) => (
      <StatusBadge status={item.isApproval ? 'Approved' : 'Pending'} />
    ),
  },
  // {
  //   key: 'tingkatBahaya' as keyof CrimeData,
  //   label: 'Tingkat Bahaya',
  //   render: (item: CrimeData) => <StatusBadge status={item.tingkatBahaya} />,
  // },
  { key: 'actions' as const, label: 'Aksi' },
];

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
    isApproval: laporan.is_approval,
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

  // Pagination state
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Stats - menggunakan totalCount untuk total, dan crimeData untuk stats halaman saat ini
  const totalCases = totalCount;
  const approvedCases = crimeData.filter((d) => d.isApproval).length;
  const pendingCases = crimeData.filter((d) => !d.isApproval).length;
  const criticalCases = crimeData.filter((d) => d.tingkatBahaya === 'Kritis' || d.tingkatBahaya === 'Tinggi').length;

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [currentPage, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await getLaporanKejahatan(params);
      const transformedData = response.results.map(transformLaporanToDisplay);
      
      setCrimeData(transformedData);
      setTotalPages(Math.ceil(response.count / pageSize));
      setTotalCount(response.count);
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (newLaporan: LaporanKejahatan) => {
    setCurrentPage(1); // Go to first page to see new data
    loadData();
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
    loadData(); // Reload current page
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
      
      // Reload current page
      loadData();
      
      alert(`Data dengan ID ${id} berhasil dihapus!`);
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert(`Gagal menghapus data: ${error.message}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, and pages around current
      pages.push(1);
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (loading && crimeData.length === 0) {
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
            title="Kasus Disetujui"
            value={approvedCases}
            icon={CheckCircle}
            trend={{ value: 8, isPositive: true }}
            variant="success"
          />
          <StatsCard
            title="Menunggu Approval"
            value={pendingCases}
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari jenis kejadian, lokasi, atau tanggal..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to page 1 when searching
            }}
            className="pl-10"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={crimeData}
          columns={columns}
          searchKeys={[]} // Search is handled by backend
          pageSize={pageSize}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Menampilkan {((currentPage - 1) * pageSize) + 1} -{' '}
              {Math.min(currentPage * pageSize, totalCount)} dari {totalCount} data
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === '...' ? (
                      <span className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className="h-8 w-8"
                      >
                        {page}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

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