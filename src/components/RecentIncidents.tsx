"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Calendar, Loader2, AlertCircle } from "lucide-react";
import { crimeAPI, formatDate, type LaporanKejahatan } from "@/lib/api";

const RecentIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<LaporanKejahatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentIncidents = async () => {
      try {
        setLoading(true);
        const data = await crimeAPI.getRecentIncidents(5);
        setIncidents(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent incidents:', err);
        setError('Gagal memuat data insiden terbaru');
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentIncidents();
    
    // Refresh data setiap 30 detik
    const interval = setInterval(fetchRecentIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityStyle = (jenisKejahatan: string) => {
    const lowerCase = jenisKejahatan.toLowerCase();
    if (lowerCase.includes('kekerasan') || lowerCase.includes('pembunuhan')) {
      return "bg-red-100 text-red-700 border-red-200";
    } else if (lowerCase.includes('narkotika') || lowerCase.includes('perampokan')) {
      return "bg-orange-100 text-orange-700 border-orange-200";
    } else if (lowerCase.includes('properti') || lowerCase.includes('pencurian')) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    } else {
      return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getSeverityLabel = (jenisKejahatan: string) => {
    const lowerCase = jenisKejahatan.toLowerCase();
    if (lowerCase.includes('kekerasan') || lowerCase.includes('pembunuhan')) {
      return "Kritis";
    } else if (lowerCase.includes('narkotika') || lowerCase.includes('perampokan')) {
      return "Tinggi";
    } else if (lowerCase.includes('properti') || lowerCase.includes('pencurian')) {
      return "Sedang";
    } else {
      return "Rendah";
    }
  };

  const getTypeColor = (type: string) => {
    const lowerCase = type.toLowerCase();
    if (lowerCase.includes('pencurian')) {
      return "bg-blue-100 text-blue-700";
    } else if (lowerCase.includes('perampokan')) {
      return "bg-red-100 text-red-700";
    } else if (lowerCase.includes('penipuan')) {
      return "bg-purple-100 text-purple-700";
    } else if (lowerCase.includes('kekerasan')) {
      return "bg-orange-100 text-orange-700";
    } else if (lowerCase.includes('narkotika')) {
      return "bg-pink-100 text-pink-700";
    } else {
      return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Insiden Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Insiden Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-sm text-slate-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Coba lagi
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Insiden Terbaru
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          5 laporan terakhir yang telah disetujui
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
        {incidents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Tidak ada data insiden</p>
              <p className="text-xs text-slate-400 mt-1">
                Belum ada laporan yang disetujui
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium text-slate-800 leading-tight flex-1 line-clamp-2">
                    {incident.nama_kejahatan_nama}
                  </h4>
                  {/* <Badge
                    className={`text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0 ${getSeverityStyle(
                      incident.jenis_kejahatan_nama
                    )}`}
                  >
                    {getSeverityLabel(incident.jenis_kejahatan_nama)}
                  </Badge> */}
                </div>

                <div className="mb-2">
                  <Badge
                    className={`text-xs px-2 py-0.5 ${getTypeColor(
                      incident.jenis_kejahatan_nama
                    )}`}
                  >
                    {incident.jenis_kejahatan_nama}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {incident.desa_nama}, {incident.kecamatan_nama}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formatDate(incident.tanggal_kejadian)}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Dilaporkan oleh: <span className="font-medium text-slate-700">{incident.nama_pelapor}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentIncidents;