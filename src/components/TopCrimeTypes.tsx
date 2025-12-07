"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Loader2 } from "lucide-react";

interface CrimeType {
  type: string;
  count: number;
  percentage: number;
}

const TopCrimeTypes: React.FC = () => {
  const [crimeTypes, setCrimeTypes] = useState<CrimeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopCrimeTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/top-crime-types');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCrimeTypes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching top crime types:', err);
        setError('Gagal memuat statistik jenis kejahatan');
        setCrimeTypes([]);
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
      "bg-slate-400",
      "bg-blue-500",
      "bg-orange-500",
      "bg-purple-500",
      "bg-cyan-500",
      "bg-pink-500"
    ];
    return colors[index] || colors[4];
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
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Jika tidak ada data, tampilkan pesan
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
            <p className="text-sm text-slate-500">Belum ada data kejahatan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hitung total kasus untuk ditampilkan di header
  const totalCases = crimeTypes.reduce((sum, crime) => sum + crime.count, 0);

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
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
        <div className="space-y-3">
          {crimeTypes.map((crime, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{crime.type}</span>
                <span className="text-xs text-black font-medium">
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
        
        {/* Tambahan: Ringkasan persentase */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            <p>5 jenis kejahatan paling umum ditampilkan.</p>
            <p className="mt-1">Data diperbarui secara real-time.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopCrimeTypes;