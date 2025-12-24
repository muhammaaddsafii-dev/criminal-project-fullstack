// src/app/admin/desa/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { AddDesaForm } from '@/components/dashboard/AddDesaForm';
import { EditDesaForm } from '@/components/dashboard/EditDesaForm';
import { ViewDesaDetail } from '@/components/dashboard/ViewDesaDetail';
import {
  getDesa,
  deleteDesa,
  type Desa,
} from '@/lib/api/desa';
import { getKecamatan, type Kecamatan } from '@/lib/api/kecamatan';

interface DesaData {
  id: string;
  nama: string;
  kecamatan: string;
  deskripsi: string;
  tanggalDibuat: string;
  rawData: Desa;
}

const columns = [
  { key: 'id' as keyof DesaData, label: 'ID' },
  { key: 'nama' as keyof DesaData, label: 'Nama Desa' },
  { key: 'kecamatan' as keyof DesaData, label: 'Kecamatan' },
  { key: 'deskripsi' as keyof DesaData, label: 'Deskripsi' },
  { key: 'tanggalDibuat' as keyof DesaData, label: 'Tanggal Dibuat' },
  { key: 'actions' as const, label: 'Aksi' },
];

const transformDesaToDisplay = (desa: Desa): DesaData => {
  return {
    id: `DSA${desa.id.toString().padStart(3, '0')}`,
    nama: desa.nama,
    kecamatan: desa.kecamatan_nama,
    deskripsi: desa.deskripsi || '-',
    tanggalDibuat: new Date(desa.created_at).toLocaleDateString('id-ID'),
    rawData: desa,
  };
};

export default function DesaPage() {
  const [desaData, setDesaData] = useState<DesaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState<Desa | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewData, setSelectedViewData] = useState<Desa | null>(null);

  // Filter & Pagination state
  const [search, setSearch] = useState('');
  const [kecamatanFilter, setKecamatanFilter] = useState('all');
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const totalDesa = totalCount;

  useEffect(() => {
    loadKecamatan();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPage, search, kecamatanFilter]);

  const loadKecamatan = async () => {
    try {
      const response = await getKecamatan({});
      setKecamatanList(response.results);
    } catch (error) {
      console.error('Error loading kecamatan:', error);
    }
  };

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
      
      if (kecamatanFilter !== 'all') {
        params.kecamatan_id = parseInt(kecamatanFilter);
      }
      
      const response = await getDesa(params);
      const transformedData = response.results.map(transformDesaToDisplay);
      
      setDesaData(transformedData);
      setTotalPages(Math.ceil(response.count / pageSize));
      setTotalCount(response.count);
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (newDesa: Desa) => {
    setCurrentPage(1);
    loadData();
  };

  const handleView = (item: DesaData) => {
    setSelectedViewData(item.rawData);
    setViewDialogOpen(true);
  };

  const handleEdit = (item: DesaData) => {
    setSelectedEditData(item.rawData);
    setEditDialogOpen(true);
  };

  const handleUpdate = (updatedDesa: Desa) => {
    loadData();
  };

  const handleDelete = async (id: string) => {
    try {
      const numericId = parseInt(id.replace('DSA', ''));
      
      if (!confirm(`Apakah Anda yakin ingin menghapus desa dengan ID ${id}?`)) {
        return;
      }

      await deleteDesa(numericId);
      loadData();
      alert(`Desa dengan ID ${id} berhasil dihapus!`);
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

  if (loading && desaData.length === 0) {
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
            <h1 className="text-2xl font-bold text-foreground">Data Desa</h1>
            <p className="text-muted-foreground">Kelola data desa di wilayah Anda</p>
          </div>
          <AddDesaForm onAdd={handleAdd} />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Desa"
            value={totalDesa}
            icon={MapPin}
            variant="primary"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama desa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          
          <Select
            value={kecamatanFilter}
            onValueChange={(value) => {
              setKecamatanFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kecamatan</SelectItem>
              {kecamatanList.map((kec) => (
                <SelectItem key={kec.id} value={kec.id.toString()}>
                  {kec.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={desaData}
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
          <EditDesaForm
            data={selectedEditData}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdate={handleUpdate}
          />
        )}

        {selectedViewData && (
          <ViewDesaDetail
            data={selectedViewData}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
}