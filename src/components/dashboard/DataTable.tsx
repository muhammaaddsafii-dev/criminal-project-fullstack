//src/components/dashboard/DataTable.tsx
"use client";

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  filterKey?: keyof T;
  filterOptions?: string[];
  pageSize?: number;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKeys = [],
  filterKey,
  filterOptions = [],
  pageSize = 10,
  onView,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewItem, setSelectedViewItem] = useState<T | null>(null);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState<T | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search && searchKeys.length > 0) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filter
    if (filter !== 'all' && filterKey) {
      result = result.filter((item) => item[filterKey] === filter);
    }

    return result;
  }, [data, search, filter, searchKeys, filterKey]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleView = (item: T) => {
    setSelectedViewItem(item);
    setViewDialogOpen(true);
    if (onView) onView(item);
  };

  const handleEdit = (item: T) => {
    setSelectedEditItem(item);
    setEditDialogOpen(true);
    if (onEdit) onEdit(item);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedDeleteId && onDelete) {
      onDelete(selectedDeleteId);
    }
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          {filterKey && filterOptions.length > 0 && (
            <Select
              value={filter}
              onValueChange={(value) => {
                setFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {filterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((column) => (
                  <TableHead key={String(column.key)} className="font-semibold text-foreground">
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="transition-colors hover:bg-muted/30"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.key === 'actions' ? (
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-info/10 hover:text-info"
                              onClick={() => handleView(item)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-warning/10 hover:text-warning"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteClick(item.id)}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : column.render ? (
                          column.render(item)
                        ) : (
                          String(item[column.key as keyof T] ?? '')
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length} data
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, arr) => {
                  const prevPage = arr[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handlePageChange(page)}
                        className="h-8 w-8"
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Dialog */}
      {/* <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Data</DialogTitle>
            <DialogDescription>
              Informasi lengkap dari data yang dipilih
            </DialogDescription>
          </DialogHeader>
          {selectedViewItem && (
            <div className="space-y-4">
              {Object.entries(selectedViewItem).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b border-border last:border-0">
                  <div className="font-semibold text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Edit Dialog */}
      {/* <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data</DialogTitle>
            <DialogDescription>
              Ubah informasi data yang dipilih (Demo - Perubahan tidak akan tersimpan)
            </DialogDescription>
          </DialogHeader>
          {selectedEditItem && (
            <div className="space-y-4">
              {Object.entries(selectedEditItem).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <Input
                    defaultValue={String(value)}
                    disabled={key === 'id'}
                    className={key === 'id' ? 'bg-muted' : ''}
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => {
              // Di sini nanti bisa tambahkan logic untuk save
              alert('Data berhasil diubah! (Demo - tidak tersimpan ke database)');
              setEditDialogOpen(false);
            }}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data dengan ID{' '}
              <span className="font-semibold">{selectedDeleteId}</span> akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}