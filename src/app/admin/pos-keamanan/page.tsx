// src/app/pos-keamanan/page.tsx - Pagination sederhana yang berfungsi
'use client';

import { useState, useEffect } from 'react';
import { Home, Shield, MapPin, Building, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { AddSecurityPostForm } from '@/components/dashboard/AddSecurityPostForm';
import { EditSecurityPostForm } from '@/components/dashboard/EditSecurityPostForm';
import { ViewSecurityPostDetail } from '@/components/dashboard/ViewSecurityPostDetail';
import {
  getPosKeamanan,
  deletePosKeamanan,
  type PosKeamanan,
  type PaginatedResponse,
} from '@/lib/api/securityPost';

// Transformed interface for display
interface SecurityPostData {
  id: string;
  nama: string;
  lokasi: string;
  alamat: string;
  jumlahFoto: number;
  rawData: PosKeamanan;
}

const columns = [
  { key: 'id' as keyof SecurityPostData, label: 'ID' },
  { key: 'nama' as keyof SecurityPostData, label: 'Nama Pos' },
  { key: 'lokasi' as keyof SecurityPostData, label: 'Lokasi' },
  { 
    key: 'alamat' as keyof SecurityPostData, 
    label: 'Alamat',
    render: (item: SecurityPostData) => (
      <div className="max-w-xs truncate">{item.alamat}</div>
    ),
  },
  { 
    key: 'jumlahFoto' as keyof SecurityPostData, 
    label: 'Foto',
    render: (item: SecurityPostData) => (
      <div className="flex items-center">
        <Building className="h-4 w-4 mr-1" />
        <span>{item.jumlahFoto}</span>
      </div>
    ),
  },
  { key: 'actions' as const, label: 'Aksi' },
];

// Transform API data to display format
const transformPosKeamananToDisplay = (pos: PosKeamanan): SecurityPostData => {
  return {
    id: `POS${pos.id.toString().padStart(3, '0')}`,
    nama: pos.nama,
    lokasi: `${pos.desa_nama}, ${pos.kecamatan_nama}`,
    alamat: pos.alamat,
    jumlahFoto: pos.foto?.length || 0,
    rawData: pos,
  };
};

export default function SecurityPostPage() {
  const [securityPostData, setSecurityPostData] = useState<SecurityPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState<PosKeamanan | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewData, setSelectedViewData] = useState<PosKeamanan | null>(null);
  
  // Pagination state
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Stats
  const totalPosts = totalCount;
  const totalPhotos = securityPostData.reduce((sum, item) => sum + item.jumlahFoto, 0);
  const totalDesa = new Set(securityPostData.map(item => item.rawData.desa_nama)).size;
  const totalKecamatan = new Set(securityPostData.map(item => item.rawData.kecamatan_nama)).size;

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
      
      const response: PaginatedResponse<PosKeamanan> = await getPosKeamanan(params);
      const transformedData = response.results.map(transformPosKeamananToDisplay);
      
      setSecurityPostData(transformedData);
      setTotalPages(Math.ceil(response.count / pageSize));
      setTotalCount(response.count);
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (newPos: PosKeamanan) => {
    setCurrentPage(1); // Go to first page to see new data
    loadData();
  };

  const handleView = (item: SecurityPostData) => {
    setSelectedViewData(item.rawData);
    setViewDialogOpen(true);
  };

  const handleEdit = (item: SecurityPostData) => {
    setSelectedEditData(item.rawData);
    setEditDialogOpen(true);
  };

  const handleUpdate = (updatedPos: PosKeamanan) => {
    loadData(); // Reload current page
  };

  const handleDelete = async (id: string) => {
    try {
      const numericId = parseInt(id.replace('POS', ''));
      await deletePosKeamanan(numericId);
      loadData(); // Reload current page
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

  if (loading && securityPostData.length === 0) {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Pos Keamanan</h1>
            <p className="text-muted-foreground">Kelola dan pantau data pos keamanan</p>
          </div>
          <AddSecurityPostForm onAdd={handleAdd} />
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Pos"
            value={totalPosts}
            icon={Home}
            trend={{ value: 5, isPositive: true }}
            variant="primary"
          />
          <StatsCard
            title="Total Foto"
            value={totalPhotos}
            icon={Shield}
            trend={{ value: 12, isPositive: true }}
            variant="success"
          />
          <StatsCard
            title="Jumlah Desa"
            value={totalDesa}
            icon={MapPin}
            variant="warning"
          />
          <StatsCard
            title="Jumlah Kecamatan"
            value={totalKecamatan}
            icon={Building}
            variant="primary"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama pos, alamat, atau lokasi..."
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
          data={securityPostData}
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
                // className="h-8 w-8"
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
          <EditSecurityPostForm
            data={selectedEditData}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdate={handleUpdate}
          />
        )}

        {/* View Dialog */}
        {selectedViewData && (
          <ViewSecurityPostDetail
            data={selectedViewData}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
}