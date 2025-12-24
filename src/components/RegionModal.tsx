//src/components/RegionModal.tsx
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
import { MapPin } from "lucide-react";
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
} from "recharts";

const COLORS = ["#f43f5e", "#8b5cf6", "#f59e0b", "#10b981", "#64748b"];

interface RegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionData: any;
}

const RegionModal: React.FC<RegionModalProps> = ({
  isOpen,
  onClose,
  regionData,
}) => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && regionData?.id) {
      fetchStatistics(regionData.id);
    }
  }, [isOpen, regionData]);

  const fetchStatistics = async (areaId: number) => {
    setLoading(true);
    try {
      // Ganti URL sesuai backend Django Anda
      const response = await fetch(`http://localhost:8000/api/map/area-statistics/${areaId}/`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStatistics(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!regionData) return null;

  const { properties } = regionData;
  const stats = statistics?.crime_stats;

  const getStatusStyle = (status: string) => {
    return status === "Selesai"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-0 z-[2000] w-[95vw] sm:w-[90vw] md:w-[85vw]">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 pr-10 sm:pr-12">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: properties?.color }}
              />
              <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 truncate">
                {properties?.name}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
            {properties?.kecamatan && properties?.desa && (
              <>Kecamatan {properties.kecamatan}, {properties.desa}</>
            )}
            {properties?.luas && (
              <> • Luas: {properties.luas.toFixed(2)} km²</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-4">Memuat statistik...</p>
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-slate-800">
                    {stats.totalCases || 0}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                    Total Kasus
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-emerald-600">
                    {stats.solved || 0}
                  </div>
                  <div className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1">
                    Selesai
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-amber-600">
                    {stats.pending || 0}
                  </div>
                  <div className="text-[10px] sm:text-xs text-amber-600 mt-0.5 sm:mt-1">
                    Proses
                  </div>
                </div>
              </div>

              {/* Infrastructure Stats */}
              {statistics?.infrastructure && (
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

              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-3 sm:mb-4 h-auto">
                  <TabsTrigger value="chart" className="text-xs sm:text-sm py-2">
                    Grafik
                  </TabsTrigger>
                  <TabsTrigger value="trend" className="text-xs sm:text-sm py-2">
                    Tren
                  </TabsTrigger>
                  <TabsTrigger value="cases" className="text-xs sm:text-sm py-2">
                    Kasus
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Bar Chart */}
                    {stats.byType && stats.byType.length > 0 && (
                      <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                          Distribusi Kasus
                        </h4>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={stats.byType} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              tick={{ fontSize: 10 }}
                              width={60}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "white",
                                border: "none",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                fontSize: "12px",
                              }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {stats.byType.map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Pie Chart */}
                    {stats.byType && stats.byType.length > 0 && (
                      <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                          Proporsi Jenis
                        </h4>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={stats.byType}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={60}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {stats.byType.map((entry: any, index: number) => (
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
                          {stats.byType.map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-1">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[index] }}
                              />
                              <span className="text-[10px] sm:text-xs text-slate-500">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="trend" className="mt-0">
                  {stats.monthlyTrend && stats.monthlyTrend.length > 0 ? (
                    <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                        Tren Kasus per Bulan
                      </h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={stats.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 10 }}
                            stroke="#94a3b8"
                          />
                          <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{
                              background: "white",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              fontSize: "12px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="cases"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, fill: "#7c3aed" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      Belum ada data tren
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cases" className="mt-0">
                  {stats.recentCases && stats.recentCases.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {stats.recentCases.map((crime: any, index: number) => (
                        <div
                          key={crime.id}
                          className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                              <span className="text-sm sm:text-lg font-bold text-slate-400">
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
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      Belum ada kasus tercatat
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