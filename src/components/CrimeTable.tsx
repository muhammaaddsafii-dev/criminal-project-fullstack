//src/components/CrimeTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableIcon, Search, Loader2 } from "lucide-react";

interface CrimeData {
  id: number;
  nama_pelapor: string;
  jenis_kejahatan_nama: string;
  nama_kejahatan_nama: string;
  kecamatan_nama: string;
  desa_nama: string;
  status_nama: string;
  tanggal_kejadian: string;
  waktu_kejadian: string;
  alamat: string;
  deskripsi: string;
  is_approval: boolean;
  created_at: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CrimeData[];
}

interface DropdownItem {
  id: number;
  nama: string;
}

const CrimeTable: React.FC = () => {
  const [data, setData] = useState<CrimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDesa, setFilterDesa] = useState("all");
  const [filterJenisKejahatan, setFilterJenisKejahatan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [desaList, setDesaList] = useState<DropdownItem[]>([]);
  const [jenisKejahatanList, setJenisKejahatanList] = useState<DropdownItem[]>([]);
  const [statusList, setStatusList] = useState<DropdownItem[]>([]);

  // Base URL untuk API Django
  const API_BASE_URL = "http://127.0.0.1:8000/api";

  // ✅ HELPER: Fungsi untuk fetch semua pages (pagination)
  const fetchAllPages = async <T extends any>(url: string): Promise<T[]> => {
    const allResults: T[] = [];
    let nextUrl: string | null = url;

    while (nextUrl) {
      try {
        const response: Response = await fetch(nextUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result: any = await response.json();
        
        // Jika response adalah paginated
        if (result.results && Array.isArray(result.results)) {
          allResults.push(...result.results);
          nextUrl = result.next; // null jika sudah halaman terakhir
        } else if (Array.isArray(result)) {
          // Jika response langsung array (non-paginated)
          allResults.push(...result);
          nextUrl = null;
        } else {
          // Format tidak dikenali
          console.error('Unexpected API format:', result);
          nextUrl = null;
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        nextUrl = null;
      }
    }

    return allResults;
  };

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Filter hanya yang sudah diapprove
      params.append('is_approval', 'true');
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterDesa !== 'all') params.append('desa_id', filterDesa);
      if (filterJenisKejahatan !== 'all') params.append('jenis_kejahatan_id', filterJenisKejahatan);
      if (filterStatus !== 'all') params.append('status_id', filterStatus);
      
      console.log('Fetching data with params:', params.toString());
      
      const response = await fetch(`${API_BASE_URL}/laporan-kejahatan/?${params.toString()}`);
      const result: ApiResponse = await response.json();
      console.log('API Response:', result);
      setData(result.results || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DIPERBAIKI: Fungsi untuk mengambil SEMUA Desa (dengan pagination)
  const fetchDesaList = async () => {
    try {
      console.log('Fetching desa list...');
      const allDesa = await fetchAllPages<any>(`${API_BASE_URL}/desa/`);
      
      const desaNames = allDesa
        .filter((item: any) => item && item.nama)
        .map((item: any) => ({ id: item.id, nama: item.nama }));
      
      setDesaList(desaNames);
      console.log(`Loaded ${desaNames.length} desa:`, desaNames);
    } catch (error) {
      console.error('Error fetching desa:', error);
      setDesaList([]);
    }
  };

  // ✅ DIPERBAIKI: Fungsi untuk mengambil SEMUA Jenis Kejahatan (dengan pagination)
  const fetchJenisKejahatanList = async () => {
    try {
      console.log('Fetching jenis kejahatan list...');
      const allJenis = await fetchAllPages<any>(`${API_BASE_URL}/jenis-kejahatan/`);
      
      const jenisNames = allJenis
        .filter((item: any) => item && item.nama_jenis_kejahatan)
        .map((item: any) => ({ id: item.id, nama: item.nama_jenis_kejahatan }));
      
      setJenisKejahatanList(jenisNames);
      console.log(`Loaded ${jenisNames.length} jenis kejahatan:`, jenisNames);
    } catch (error) {
      console.error('Error fetching jenis kejahatan:', error);
      setJenisKejahatanList([]);
    }
  };

  // ✅ DIPERBAIKI: Fungsi untuk mengambil SEMUA Status (dengan pagination)
  const fetchStatusList = async () => {
    try {
      console.log('Fetching status list...');
      const allStatus = await fetchAllPages<any>(`${API_BASE_URL}/status/`);
      
      const statusNames = allStatus
        .filter((item: any) => item && item.nama)
        .map((item: any) => ({ id: item.id, nama: item.nama }));
      
      setStatusList(statusNames);
      console.log(`Loaded ${statusNames.length} status:`, statusNames);
    } catch (error) {
      console.error('Error fetching status:', error);
      setStatusList([]);
    }
  };

  // Load data saat komponen mount atau filter berubah
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300); // Debounce 300ms
    return () => clearTimeout(timer);
  }, [searchTerm, filterDesa, filterJenisKejahatan, filterStatus]);

  // Load desa, jenis kejahatan, dan status saat komponen mount
  useEffect(() => {
    fetchDesaList();
    fetchJenisKejahatanList();
    fetchStatusList();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "dilaporkan":
        return "bg-blue-100 text-blue-800";
      case "dalam proses":
        return "bg-yellow-100 text-yellow-800";
      case "ditindaklanjuti":
        return "bg-orange-100 text-orange-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "ditolak":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getJenisKejahatanStyle = (jenis: string) => {
    switch (jenis.toLowerCase()) {
      case "kejahatan properti":
        return "bg-blue-100 text-blue-700";
      case "kejahatan kekerasan":
        return "bg-red-100 text-red-700";
      case "kejahatan narkotika":
        return "bg-purple-100 text-purple-700";
      case "kejahatan seksual":
        return "bg-pink-100 text-pink-700";
      case "kejahatan white collar":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="border-b bg-slate-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Title di kiri */}
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <TableIcon className="w-5 h-5" />
            Data Kriminalitas {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>

          {/* Search dan Filter di kanan */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari nama/alamat/deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[220px] h-9 text-sm"
              />
            </div>

            {/* Filter Desa */}
            <Select value={filterDesa} onValueChange={setFilterDesa}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Semua Desa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Desa ({desaList.length})</SelectItem>
                {desaList.map((desa) => (
                  <SelectItem key={desa.id} value={desa.id.toString()}>
                    {desa.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Jenis Kejahatan */}
            <Select value={filterJenisKejahatan} onValueChange={setFilterJenisKejahatan}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Semua Jenis Kejahatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis Kejahatan</SelectItem>
                {jenisKejahatanList.map((jenis) => (
                  <SelectItem key={jenis.id} value={jenis.id.toString()}>
                    {jenis.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {statusList.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Table dengan Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Table with Fixed Header and Scrollable Body */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 w-[150px]">
                      Nama Pelapor
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[140px]">
                      Desa
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[180px]">
                      Jenis Kejahatan
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[180px]">
                      Nama Kejahatan
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[200px]">
                      Alamat
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[130px]">
                      Tanggal Kejadian
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[130px]">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>

              {/* Scrollable Table Body */}
              <div className="overflow-y-auto overflow-x-auto max-h-[400px]">
                <Table>
                  <TableBody>
                    {data.length > 0 ? (
                      data.map((item) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <TableCell className="font-medium text-slate-700 w-[150px]">
                            {item.nama_pelapor}
                          </TableCell>
                          <TableCell className="text-slate-600 w-[140px]">
                            {item.desa_nama}
                          </TableCell>
                          <TableCell className="w-[180px]">
                            <Badge
                              variant="secondary"
                              className={`${getJenisKejahatanStyle(item.jenis_kejahatan_nama)} font-medium`}
                            >
                              {item.jenis_kejahatan_nama}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 w-[180px]">
                            {item.nama_kejahatan_nama}
                          </TableCell>
                          <TableCell className="text-slate-600 w-[200px]">
                            {item.alamat}
                          </TableCell>
                          <TableCell className="text-slate-600 w-[130px]">
                            {new Date(item.tanggal_kejadian).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="w-[130px]">
                            <Badge
                              variant="secondary"
                              className={`${getStatusStyle(item.status_nama)} font-medium`}
                            >
                              {item.status_nama}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-slate-500"
                        >
                          Tidak ada data yang ditemukan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Footer dengan jumlah data */}
            <div className="text-sm text-slate-600">
              Menampilkan {data.length} data laporan yang telah disetujui
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CrimeTable;