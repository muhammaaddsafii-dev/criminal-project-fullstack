"use client";

import React, { useState } from "react";
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
import { TableIcon, Search, Filter } from "lucide-react";

interface CrimeData {
  id: number;
  district: string;
  type: string;
  location: string;
  date: string;
  status: string;
  reportNumber: string;
}

interface CrimeTableProps {
  data: CrimeData[];
}

const CrimeTable: React.FC<CrimeTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const getStatusStyle = (status: string) => {
    return status === "Selesai"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
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

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reportNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict =
      filterDistrict === "all" || item.district === filterDistrict;
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    const matchType = filterType === "all" || item.type === filterType;

    return matchSearch && matchDistrict && matchStatus && matchType;
  });

  const districts = [...new Set(data.map((item) => item.district))];
  const types = [...new Set(data.map((item) => item.type))];

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title di kiri */}
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <TableIcon className="mr-2 h-5 w-5 text-blue-600" />
            Data Kriminalitas
          </CardTitle>

          {/* Search dan Filter di kanan */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari lokasi atau nomor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[220px] h-9 text-sm"
              />
            </div>

            {/* Filter District */}
            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
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
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
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

            {/* Filter Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Proses">Proses</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table with Fixed Header and Scrollable Body */}
        <div className="overflow-hidden">
          <div className="overflow-y-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 w-[140px]">
                    No. Laporan
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Wilayah
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Jenis
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Lokasi
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Tanggal
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-slate-600">
                        {item.reportNumber}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {item.district}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${getTypeStyle(item.type)} font-medium`}
                        >
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.location}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(item.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${getStatusStyle(item.status)} font-medium`}
                        >
                          {item.status}
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

        {/* Footer with data count - Fixed at bottom */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
          <p className="text-sm text-slate-600">
            Menampilkan {filteredData.length} dari {data.length} data
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrimeTable;
