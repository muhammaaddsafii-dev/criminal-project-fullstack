//src/components/RegionModal.tsx - WITH CLASSIFICATION
"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, TrendingUp, BarChart3, List, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#f43f5e", "#8b5cf6", "#f59e0b", "#10b981", "#64748b", "#3b82f6", "#ec4899", "#14b8a6"];

interface RegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionData: any;
}

interface CrimeStats {
  totalCases: number;
  solved: number;
  pending: number;
  byType: Array<{ name: string; value: number }>;
  monthlyTrend: Array<{ month: string; cases: number }>;
  recentCases: Array<{
    id: number;
    type: string;
    location: string;
    date: string;
    status: string;
  }>;
}

interface AreaInfo {
  id: number;
  name: string;
  kecamatan: string;
  luas: number;
  classification: 'RENDAH' | 'SEDANG' | 'TINGGI';
  classification_color: string;
  classification_level: number;
}

interface Infrastructure {
  security_posts: number;
  cctvs: number;
}

interface Thresholds {
  low_max: number;
  medium_max: number;
  high_min: number;
}

interface StatisticsData {
  area_info: AreaInfo;
  crime_stats: CrimeStats;
  infrastructure: Infrastructure;
  thresholds: Thresholds;
}

const RegionModal: React.FC<RegionModalProps> = ({
  isOpen,
  onClose,
  regionData,
}) => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && regionData?.id) {
      fetchStatistics(regionData.id);
    }
  }, [isOpen, regionData]);

  const fetchStatistics = async (areaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/map/area-statistics/${areaId}/`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStatistics(result.data);
        } else {
          setError(result.message || "Gagal memuat data statistik");
        }
      } else {
        setError("Gagal mengambil data dari server");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  if (!regionData) return null;

  const { properties } = regionData;

  // Fungsi untuk mendapatkan style badge klasifikasi
  const getClassificationStyle = (classification: string) => {
    switch (classification) {
      case 'TINGGI':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-300',
          icon: '🔴'
        };
      case 'SEDANG':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-300',
          icon: '🟡'
        };
      case 'RENDAH':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-300',
          icon: '🟢'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          icon: '⚪'
        };
    }
  };

  const getStatusStyle = (status: string) => {
    return status?.toLowerCase().includes("selesai")
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0 z-[2000] w-[95vw] sm:w-[90vw] md:w-[85vw]">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 pr-10 sm:pr-12">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: statistics?.area_info?.classification_color || properties?.color || "#8b5cf6" 
                }}
              />
              <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 truncate">
                {statistics?.area_info?.name || properties?.name || "Area"}
              </DialogTitle>
            </div>
            
            {/* Badge Klasifikasi */}
            {statistics?.area_info?.classification && (
              <Badge 
                className={`
                  ${getClassificationStyle(statistics.area_info.classification).bg}
                  ${getClassificationStyle(statistics.area_info.classification).text}
                  border ${getClassificationStyle(statistics.area_info.classification).border}
                  px-3 py-1 text-xs sm:text-sm font-semibold flex items-center gap-1
                `}
              >
                <span>{getClassificationStyle(statistics.area_info.classification).icon}</span>
                <span>{statistics.area_info.classification}</span>
              </Badge>
            )}
          </div>
          
          <DialogDescription className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
            {statistics?.area_info ? (
              <>
                Kecamatan {statistics.area_info.kecamatan}
                {statistics.area_info.luas && (
                  <> • Luas: {statistics.area_info.luas.toFixed(2)} km²</>
                )}
              </>
            ) : (
              <>
                {properties?.kecamatan && properties?.desa && (
                  <>Kecamatan {properties.kecamatan}, {properties.desa}</>
                )}
                {properties?.luas && (
                  <> • Luas: {properties.luas.toFixed(2)} km²</>
                )}
              </>
            )}
          </DialogDescription>
          
          {/* Info Threshold */}
          {statistics?.thresholds && (
            <div className="mt-2 text-xs text-slate-400 bg-slate-50 rounded p-2">
              <span className="font-medium">Kategori:</span> 
              <span className="ml-2">
                🟢 Rendah: ≤{statistics.thresholds.low_max} kasus
              </span>
              <span className="ml-2">
                🟡 Sedang: {statistics.thresholds.low_max + 1}-{statistics.thresholds.medium_max} kasus
              </span>
              <span className="ml-2">
                🔴 Tinggi: ≥{statistics.thresholds.high_min} kasus
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-4">Memuat statistik...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-slate-600">{error}</p>
            </div>
          ) : statistics ? (
            <>
              {/* Summary Stats dengan style berdasarkan klasifikasi */}
              {/* <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div 
                  className={`
                    rounded-lg sm:rounded-xl p-2 sm:p-4 text-center
                    ${statistics.area_info.classification === 'TINGGI' ? 'bg-red-50' : 
                      statistics.area_info.classification === 'SEDANG' ? 'bg-amber-50' : 'bg-green-50'}
                  `}
                >
                  <div 
                    className={`
                      text-lg sm:text-2xl font-bold
                      ${statistics.area_info.classification === 'TINGGI' ? 'text-red-600' : 
                        statistics.area_info.classification === 'SEDANG' ? 'text-amber-600' : 'text-green-600'}
                    `}
                  >
                    {statistics.crime_stats.totalCases || 0}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                    Total Kasus
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-emerald-600">
                    {statistics.crime_stats.solved || 0}
                  </div>
                  <div className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1">
                    Selesai
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-amber-600">
                    {statistics.crime_stats.pending || 0}
                  </div>
                  <div className="text-[10px] sm:text-xs text-amber-600 mt-0.5 sm:mt-1">
                    Proses
                  </div>
                </div>
              </div> */}

              {/* Infrastructure Stats */}
              {statistics.infrastructure && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-base sm:text-lg font-bold text-green-600">
                      {statistics.infrastructure.security_posts || 0}
                    </div>
                    <div className="text-[10px] sm:text-xs text-green-600 mt-0.5">
                      Pos Keamanan
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-base sm:text-lg font-bold text-blue-600">
                      {statistics.infrastructure.cctvs || 0}
                    </div>
                    <div className="text-[10px] sm:text-xs text-blue-600 mt-0.5">
                      CCTV
                    </div>
                  </div>
                </div>
              )}

              {/* Alert untuk area tinggi */}
              {statistics.area_info.classification === 'TINGGI' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Area Tingkat Kriminalitas Tinggi</p>
                    <p className="text-xs text-red-600 mt-1">
                      Area ini memiliki tingkat kriminalitas yang tinggi. Diperlukan peningkatan pengawasan dan tindakan preventif.
                    </p>
                  </div>
                </div>
              )}

              {/* Tabs dengan 3 Tab */}
              <Tabs defaultValue="distribusi" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-3 sm:mb-4 h-auto">
                  <TabsTrigger value="distribusi" className="text-xs sm:text-sm py-2 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Distribusi</span>
                  </TabsTrigger>
                  <TabsTrigger value="tren" className="text-xs sm:text-sm py-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Tren</span>
                  </TabsTrigger>
                  <TabsTrigger value="kasus" className="text-xs sm:text-sm py-2 flex items-center gap-1">
                    <List className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Top Kasus</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Grafik Distribusi (Bar Chart & Pie Chart) */}
                <TabsContent value="distribusi" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Bar Chart */}
                    {statistics.crime_stats.byType && statistics.crime_stats.byType.length > 0 ? (
                      <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                          Distribusi Kasus per Jenis
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={statistics.crime_stats.byType}
                            layout="horizontal"
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <XAxis
                              dataKey="name"
                              type="category"
                              tick={{ fontSize: 10 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{
                                background: "white",
                                border: "none",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                fontSize: "12px",
                              }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {statistics.crime_stats.byType.map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-lg sm:rounded-xl p-8 text-center">
                        <p className="text-slate-400">Belum ada data distribusi kasus</p>
                      </div>
                    )}

                    {/* Pie Chart */}
                    {statistics.crime_stats.byType && statistics.crime_stats.byType.length > 0 ? (
                      <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                          Proporsi Jenis Kasus
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={statistics.crime_stats.byType}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, percent = 0 }) => 
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                              labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                            >
                              {statistics.crime_stats.byType.map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: "white",
                                border: "none",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                fontSize: "12px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-2">
                          {statistics.crime_stats.byType.map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-1">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-[10px] sm:text-xs text-slate-500">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-lg sm:rounded-xl p-8 text-center">
                        <p className="text-slate-400">Belum ada data proporsi kasus</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 2: Tren Kasus per Bulan (Line Chart) */}
                <TabsContent value="tren" className="mt-0">
                  {statistics.crime_stats.monthlyTrend && statistics.crime_stats.monthlyTrend.length > 0 ? (
                    <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                        Tren Kasus per Bulan (12 Bulan Terakhir)
                      </h4>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart 
                          data={statistics.crime_stats.monthlyTrend}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11 }}
                            stroke="#94a3b8"
                          />
                          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{
                              background: "white",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              fontSize: "12px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="cases"
                            name="Jumlah Kasus"
                            stroke={statistics.area_info.classification_color}
                            strokeWidth={3}
                            dot={{ fill: statistics.area_info.classification_color, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                      <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400">Belum ada data tren bulanan</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: List Top Kasus */}
                <TabsContent value="kasus" className="mt-0">
                  {statistics.crime_stats.recentCases && statistics.crime_stats.recentCases.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-3">
                        10 Kasus Terbaru
                      </h4>
                      {statistics.crime_stats.recentCases.map((crime: any, index: number) => (
                        <div
                          key={crime.id}
                          className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-slate-200">
                              <span className="text-sm sm:text-lg font-bold text-slate-600">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs sm:text-sm text-slate-800 truncate">
                                {crime.type}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{crime.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge
                              className={`${getStatusStyle(
                                crime.status
                              )} text-[10px] sm:text-xs px-2 py-0.5`}
                            >
                              {crime.status}
                            </Badge>
                            <div className="text-[9px] sm:text-xs text-slate-400 mt-1">
                              {new Date(crime.date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                      <List className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400">Belum ada kasus tercatat</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Tidak ada data statistik
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegionModal;