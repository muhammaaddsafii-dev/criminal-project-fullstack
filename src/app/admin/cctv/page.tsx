"use client";

import { useState, useEffect } from 'react';
import { Video, MapPin, Trash2, Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddCCTVForm } from '@/components/dashboard/AddCCTVForm';
import { EditCCTVForm } from '@/components/dashboard/EditCCTVForm';
import { ViewCCTVDetail } from '@/components/dashboard/ViewCCTVDetail';
import { getCCTV, deleteCCTV, type CCTV } from '@/lib/api/cctv';

export default function CCTVPage() {
  const [data, setData] = useState<CCTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<CCTV | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm]); // Reload ketika page atau search berubah

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getCCTV({
        page: currentPage,
        search: searchTerm || undefined,
      });
      
      setData(response.results);
      setTotalCount(response.count);
      setHasNext(response.next !== null);
      setHasPrevious(response.previous !== null);
    } catch (error) {
      console.error('Error loading CCTV data:', error);
      alert('Gagal memuat data CCTV');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (newData: CCTV) => {
    // Reload data setelah tambah
    loadData();
  };

  const handleUpdate = (updatedData: CCTV) => {
    setData(prev => prev.map(item => item.id === updatedData.id ? updatedData : item));
    setSelectedItem(updatedData);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      await deleteCCTV(id);
      setData(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => prev - 1);
      alert('Data berhasil dihapus');
      
      // Jika halaman jadi kosong, pindah ke halaman sebelumnya
      if (data.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting CCTV:', error);
      alert('Gagal menghapus data');
    }
  };

  const handleView = (item: CCTV) => {
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleEdit = (item: CCTV) => {
    setSelectedItem(item);
    setEditOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset ke halaman 1 saat search
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data CCTV</h1>
          <p className="text-muted-foreground">
            Kelola data CCTV dan lokasi pengawasan
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total CCTV"
            value={totalCount}
            icon={Video}
          />
          <StatsCard
            title="Lokasi Aktif"
            value={totalCount}
            icon={MapPin}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Cari berdasarkan nama lokasi, kecamatan, atau desa..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
          />
          <AddCCTVForm onAdd={handleAdd} />
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Nama Lokasi</TableHead>
                <TableHead>Kecamatan</TableHead>
                <TableHead>Desa</TableHead>
                <TableHead>URL Stream</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ? 'Tidak ada data yang sesuai' : 'Belum ada data CCTV'}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.nama_lokasi}</TableCell>
                    <TableCell>{item.kecamatan_nama}</TableCell>
                    <TableCell>{item.desa_nama}</TableCell>
                    <TableCell>
                      {item.url_cctv ? (
                        <a 
                          href={item.url_cctv} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Lihat Stream
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(item)}
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} dari {totalCount} data
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevious || loading}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-2">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      disabled={loading}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext || loading}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedItem && (
        <>
          <ViewCCTVDetail
            data={selectedItem}
            open={viewOpen}
            onOpenChange={setViewOpen}
          />
          <EditCCTVForm
            data={selectedItem}
            open={editOpen}
            onOpenChange={setEditOpen}
            onUpdate={handleUpdate}
          />
        </>
      )}
    </DashboardLayout>
  );
}
