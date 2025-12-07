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
  district: string;
  type: string;
  location: string;
  date: string;
  severity: string; // Changed from status to severity
  reportNumber: string;
}

const CrimeTable: React.FC = () => {
  const [data, setData] = useState<CrimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [districts, setDistricts] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterDistrict !== 'all') params.append('district', filterDistrict);
      if (filterSeverity !== 'all') params.append('severity', filterSeverity);
      if (filterType !== 'all') params.append('type', filterType);
      
      console.log('Fetching data with params:', params.toString());
      
      const response = await fetch(`/api/crime-data?${params.toString()}`);
      const result = await response.json();
      console.log('API Response:', result);
      setData(result.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil daftar wilayah
  const fetchDistricts = async () => {
    try {
      console.log('Fetching districts...');
      const response = await fetch('/api/districts');
      const result = await response.json();
      console.log('Districts API Response:', result);
      
      // Pastikan result adalah array dan tidak undefined
      if (Array.isArray(result)) {
        const districtNames = result
          .filter((item: any) => item && item.district) // Filter out null/undefined
          .map((item: any) => item.district);
        setDistricts(districtNames);
        console.log('Extracted district names:', districtNames);
      } else {
        console.error('Districts API did not return an array:', result);
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    }
  };

  // Fungsi untuk mengambil daftar jenis kejahatan dari tabel types
  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/crime-types');
      const result = await response.json();
      setTypes(result || []);
    } catch (error) {
      console.error('Error fetching crime types:', error);
      setTypes([]);
    }
  };

  // Load data saat komponen mount atau filter berubah
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300); // Debounce 300ms
    return () => clearTimeout(timer);
  }, [searchTerm, filterDistrict, filterSeverity, filterType]);

  // Load districts dan types saat komponen mount
  useEffect(() => {
    fetchDistricts();
    fetchTypes();
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Pencurian":
        return "bg-blue-100 text-blue-700";
      case "Perampokan":
        return "bg-red-100 text-red-700";
      case "Penipuan":
        return "bg-purple-100 text-purple-700";
      case "Kekerasan":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "Rendah";
      case "MEDIUM":
        return "Sedang";
      case "HIGH":
        return "Tinggi";
      case "CRITICAL":
        return "Kritis";
      default:
        return severity;
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
                placeholder="Cari lokasi/no. laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[220px] h-9 text-sm"
              />
            </div>

            {/* Filter District */}
            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Semua Wilayah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Wilayah</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Type */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Severity */}
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Semua Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Severity</SelectItem>
                <SelectItem value="LOW">Rendah</SelectItem>
                <SelectItem value="MEDIUM">Sedang</SelectItem>
                <SelectItem value="HIGH">Tinggi</SelectItem>
                <SelectItem value="CRITICAL">Kritis</SelectItem>
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
                    <TableHead className="font-semibold text-slate-700 w-[140px]">
                      No. Laporan
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[140px]">
                      Wilayah
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[130px]">
                      Jenis
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[200px]">
                      Lokasi
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[130px]">
                      Tanggal
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[110px]">
                      Severity
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
                          <TableCell className="font-mono text-xs text-slate-600 w-[140px]">
                            {item.reportNumber}
                          </TableCell>
                          <TableCell className="font-medium text-slate-700 w-[140px]">
                            {item.district}
                          </TableCell>
                          <TableCell className="w-[130px]">
                            <Badge
                              variant="secondary"
                              className={`${getTypeStyle(item.type)} font-medium`}
                            >
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 w-[200px]">
                            {item.location}
                          </TableCell>
                          <TableCell className="text-slate-600 w-[130px]">
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="w-[110px]">
                            <Badge
                              variant="secondary"
                              className={`${getSeverityStyle(
                                item.severity
                              )} font-medium`}
                            >
                              {getSeverityLabel(item.severity)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
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
              Menampilkan {data.length} data
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CrimeTable;