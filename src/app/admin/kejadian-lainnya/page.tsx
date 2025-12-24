// src/app/admin/kejadian-lainnya/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileWarning, AlertTriangle, CheckCircle, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
// import { AddKejadianLainnyaForm } from '@/AddKejadianlainnyaFormcomponents/dashboard/AddKejadianLainnyaForm';
import { AddKejadianLainnyaForm } from '@/components/dashboard/AddKejadianLainnyaForm';
import { EditKejadianLainnyaForm } from '@/components/dashboard/EditKejadianLainnyaForm';
import { ViewKejadianLainnyaDetail } from '@/components/dashboard/ViewKejadianLainnyaDetail';
import {
  getKejadianLainnya,
  deleteKejadianLainnya,
  type KejadianLainnya,
} from '@/lib/api/kejadian-lainnya';

interface KejadianData {
  id: string;
  namaKejadian: string;
  namaPelapor: string;
  lokasi: string;
  tanggal: string;
  isApproval: boolean;
  rawData: KejadianLainnya;
}

const columns = [
  { key: 'id' as keyof KejadianData, label: 'ID' },
  { key: 'namaKejadian' as keyof KejadianData, label: 'Nama Kejadian' },
  { key: 'namaPelapor' as keyof KejadianData, label: 'Pelapor' },
  { key: 'lokasi' as keyof KejadianData, label: 'Lokasi' },
  { key: 'tanggal' as keyof KejadianData, label: 'Tanggal' },
  {
    key: 'isApproval' as keyof KejadianData,
    label: 'Status Approval',
    render: (item: KejadianData) => (
      <StatusBadge status={item.isApproval ? 'Approved' : 'Pending'} />
    ),
  },
  { key: 'actions' as const, label: 'Aksi' },
];

const transformKejadianToDisplay = (kejadian: KejadianLainnya): KejadianData => {
  return {
    id: `KEJ${kejadian.id.toString().padStart(3, '0')}`,
    namaKejadian: kejadian.nama_kejadian,
    namaPelapor: kejadian.nama_pelapor,
    lokasi: `${kejadian.desa_nama}, ${kejadian.kecamatan_nama}`,
    tanggal: new Date(kejadian.tanggal_kejadian).toLocaleDateString('id-ID'),
    isApproval: kejadian.is_approval,
    rawData: kejadian,
  };
};

export default function KejadianLainnyaPage() {
  const [kejadianData, setKejadianData] = useState<KejadianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState<KejadianLainnya | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewData, setSelectedViewData] = useState<KejadianLainnya | null>(null);

  // Pagination state
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Stats
  const totalKejadian = totalCount;
  const approvedKejadian = kejadianData.filter((d) => d.isApproval).length;
  const pendingKejadian = kejadianData.filter((d) => !d.isApproval).length;

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
      
      const response = await getKejadianLainnya(params);
      const transformedData = response.results.map(transformKejadianToDisplay);
      
      setKejadianData(transformedData);
      setTotalPages(Math.ceil(response.count / pageSize));
      setTotalCount(response.count);
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (newKejadian: KejadianLainnya) => {
    setCurrentPage(1);
    loadData();
  };

  const handleView = (item: KejadianData) => {
    setSelectedViewData(item.rawData);
    setViewDialogOpen(true);
  };

  const handleEdit = (item: KejadianData) => {
    setSelectedEditData(item.rawData);
    setEditDialogOpen(true);
  };

  const handleUpdate = (updatedKejadian: KejadianLainnya) => {
    loadData();
  };

  const handleDelete = async (id: string) => {
    try {
      const numericId = parseInt(id.replace('KEJ', ''));
      
      if (!confirm(`Apakah Anda yakin ingin menghapus data dengan ID ${id}?`)) {
        return;
      }

      await deleteKejadianLainnya(numericId);
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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
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

  if (loading && kejadianData.length === 0) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Kejadian Lainnya</h1>
            <p className="text-muted-foreground">Kelola dan pantau data kejadian lainnya</p>
          </div>
          <AddKejadianLainnyaForm onAdd={handleAdd} />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Kejadian"
            value={totalKejadian}
            icon={FileWarning}
            variant="primary"
          />
          <StatsCard
            title="Kejadian Disetujui"
            value={approvedKejadian}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Menunggu Approval"
            value={pendingKejadian}
            icon={Clock}
            variant="warning"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama kejadian, pelapor, atau lokasi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <DataTable
          data={kejadianData}
          columns={columns}
          searchKeys={[]}
          pageSize={pageSize}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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

        {selectedEditData && (
          <EditKejadianLainnyaForm
            data={selectedEditData}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdate={handleUpdate}
          />
        )}

        {selectedViewData && (
          <ViewKejadianLainnyaDetail
            data={selectedViewData}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
}