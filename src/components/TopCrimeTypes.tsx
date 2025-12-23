"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Loader2, AlertCircle } from "lucide-react";

interface CrimeType {
  type: string;
  count: number;
  percentage: number;
}

const TopCrimeTypes: React.FC = () => {
  const [crimeTypes, setCrimeTypes] = useState<CrimeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCases, setTotalCases] = useState(0);

  useEffect(() => {
    const fetchTopCrimeTypes = async () => {
      try {
        setLoading(true);
        // Fetch all approved crime reports
        const response = await fetch(
          'http://127.0.0.1:8000/api/laporan-kejahatan/?is_approval=true'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Group by jenis_kejahatan_nama and count occurrences
        const crimeMap = new Map<string, number>();
        let total = 0;
        
        // Process all pages if there are more
        let allResults = [...data.results];
        let nextUrl = data.next;
        
        // Fetch all pages
        while (nextUrl) {
          const nextResponse = await fetch(nextUrl);
          const nextData = await nextResponse.json();
          allResults = [...allResults, ...nextData.results];
          nextUrl = nextData.next;
        }
        
        // Count occurrences
        allResults.forEach((item: any) => {
          const crimeType = item.jenis_kejahatan_nama;
          crimeMap.set(crimeType, (crimeMap.get(crimeType) || 0) + 1);
          total++;
        });
        
        // Convert to array and sort by count
        const crimeArray: CrimeType[] = Array.from(crimeMap.entries())
          .map(([type, count]) => ({
            type,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Get top 5
        
        setCrimeTypes(crimeArray);
        setTotalCases(total);
        setError(null);
      } catch (err) {
        console.error('Error fetching top crime types:', err);
        setError('Gagal memuat statistik jenis kejahatan');
        setCrimeTypes([]);
        setTotalCases(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCrimeTypes();
    
    // Refresh data setiap 60 detik
    const interval = setInterval(fetchTopCrimeTypes, 60000);
    return () => clearInterval(interval);
  }, []);

  const getBarColor = (index: number) => {
    const colors = [
      "bg-rose-500",
      "bg-violet-500",
      "bg-amber-500",
      "bg-emerald-500",
      "bg-blue-500",
      "bg-orange-500",
      "bg-purple-500",
      "bg-cyan-500",
      "bg-pink-500",
      "bg-slate-400"
    ];
    return colors[index] || colors[9];
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-500" />
            Top Jenis Kriminalitas
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
            <PieChart className="w-4 h-4 text-violet-500" />
            Top Jenis Kriminalitas
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

  if (crimeTypes.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-500" />
            Top Jenis Kriminalitas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Belum ada data kejahatan</p>
              <p className="text-xs text-slate-400 mt-1">
                Tidak ada laporan yang disetujui
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-500" />
            Top Jenis Kriminalitas
          </CardTitle>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Total: {totalCases} kasus
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          5 jenis kejahatan paling sering terjadi
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
        <div className="space-y-3">
          {crimeTypes.map((crime, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 truncate pr-2">
                  {crime.type}
                </span>
                <span className="text-xs text-black font-medium whitespace-nowrap">
                  {crime.count} kasus ({crime.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getBarColor(
                    index
                  )} transition-all duration-500`}
                  style={{ width: `${crime.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Ringkasan */}
        {/* <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            <p>Menampilkan {crimeTypes.length} jenis kejahatan teratas dari total {totalCases} laporan yang disetujui.</p>
            <p className="mt-1">Data diperbarui secara real-time setiap 60 detik.</p>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default TopCrimeTypes;