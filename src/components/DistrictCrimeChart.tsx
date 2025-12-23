"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DistrictData {
  name: string;
  total: number;
  details?: {
    [key: string]: number;
  };
}

interface SummaryStats {
  totalDistricts: number;
  totalCrimes: number;
  avgCrimePerDistrict: number;
}

const DistrictCrimeChart: React.FC = () => {
  const [data, setData] = useState<DistrictData[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistrictStats = async () => {
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
        
        // Fetch all pages
        let allResults = [...data.results];
        let nextUrl = data.next;
        
        while (nextUrl) {
          const nextResponse = await fetch(nextUrl);
          const nextData = await nextResponse.json();
          allResults = [...allResults, ...nextData.results];
          nextUrl = nextData.next;
        }
        
        // Group by desa (village) and count occurrences
        const districtMap = new Map<string, {
          count: number;
          types: Map<string, number>;
        }>();
        
        allResults.forEach((item: any) => {
          const district = item.desa_nama;
          const crimeType = item.jenis_kejahatan_nama;
          
          if (!districtMap.has(district)) {
            districtMap.set(district, {
              count: 0,
              types: new Map()
            });
          }
          
          const districtData = districtMap.get(district)!;
          districtData.count++;
          districtData.types.set(
            crimeType, 
            (districtData.types.get(crimeType) || 0) + 1
          );
        });
        
        // Convert to array and sort by count
        const districtArray: DistrictData[] = Array.from(districtMap.entries())
          .map(([name, data]) => {
            const details: { [key: string]: number } = {};
            data.types.forEach((count, type) => {
              details[type] = count;
            });
            
            return {
              name,
              total: data.count,
              details
            };
          })
          .sort((a, b) => b.total - a.total)
          .slice(0, 5); // Get top 5 districts
        
        // Calculate summary statistics
        const totalCrimes = allResults.length;
        const totalDistricts = districtMap.size;
        const avgCrimePerDistrict = totalDistricts > 0 
          ? totalCrimes / totalDistricts 
          : 0;
        
        setData(districtArray);
        setSummary({
          totalDistricts,
          totalCrimes,
          avgCrimePerDistrict
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching district stats:', err);
        setError('Gagal memuat statistik wilayah');
        setData([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictStats();
    
    // Refresh data setiap 60 detik
    const interval = setInterval(fetchDistrictStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Warna gradient untuk bar chart
  const getBarColor = (index: number) => {
    const colors = [
      "#ef4444", // red-500 - untuk area dengan crime tertinggi
      "#f97316", // orange-500
      "#f59e0b", // amber-500
      "#eab308", // yellow-500
      "#84cc16", // lime-500
      "#22c55e", // green-500
      "#3b82f6", // blue-500
      "#8b5cf6", // violet-500
      "#ec4899", // pink-500
      "#14b8a6", // teal-500
    ];
    return colors[index] || "#94a3b8"; // slate-400
  };

  // Custom tooltip dengan informasi detail
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const district = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 max-w-xs">
          <p className="text-sm font-bold text-slate-800 mb-2">
            {district.name}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Total Kasus:</span>
              <span className="text-sm font-bold text-slate-800">{district.total}</span>
            </div>
            
            {district.details && (
              <div className="pt-2 mt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-600 mb-2">Detail per Jenis:</p>
                <div className="space-y-1">
                  {Object.entries(district.details).map(([type, count]: [string, any]) => (
                    <div key={type} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 truncate pr-2">{type}:</span>
                      <span className="font-semibold text-slate-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Top Kriminalitas per Wilayah
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 px-4 pb-4 pt-2 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Top Kriminalitas per Wilayah
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 px-4 pb-4 pt-2 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm text-slate-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Coba lagi
          </button>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Top Kriminalitas per Wilayah
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 px-4 pb-4 pt-2 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">Belum ada data kriminalitas</p>
          <p className="text-xs text-slate-400 mt-1">Tidak ada laporan yang disetujui di wilayah manapun</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Top Kriminalitas per Wilayah
          </CardTitle>
        </div>
        {summary && (
          <div className="mt-2 text-xs text-slate-500">
            {/* <p>Menampilkan {data.length} desa dengan kasus terbanyak dari {summary.totalDistricts} total desa</p> */}
            <p className="mt-1">
              <span className="text-blue-600 font-medium">{summary.totalCrimes} kasus</span> telah dilaporkan dan disetujui
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-4 pt-2" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#64748b" }}
              stroke="#cbd5e1"
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: "#475569" }}
              width={80}
              stroke="#cbd5e1"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(index)}
                  strokeWidth={1}
                  stroke="#fff"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Statistik Ringkasan */}
        {summary && data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-red-50 p-2 rounded">
                <div className="font-medium text-red-700">Desa Paling Rawan</div>
                <div className="font-bold text-red-800 truncate">{data[0]?.name || '-'}</div>
                <div className="text-red-600">{data[0]?.total || 0} kasus</div>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium text-blue-700">Total Kasus</div>
                <div className="font-bold text-blue-800">{summary.totalCrimes}</div>
                <div className="text-blue-600">semua wilayah</div>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <div className="font-medium text-slate-700">Rata-rata</div>
                <div className="font-bold text-slate-800">
                  {Math.round(summary.avgCrimePerDistrict)}
                </div>
                <div className="text-slate-600">kasus per desa</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DistrictCrimeChart;