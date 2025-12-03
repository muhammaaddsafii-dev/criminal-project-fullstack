"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, TrendingUp, FileCheck, Clock, MapPin } from "lucide-react";
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
  crimeStats: any;
}

const RegionModal: React.FC<RegionModalProps> = ({
  isOpen,
  onClose,
  regionData,
  crimeStats,
}) => {
  if (!regionData || !crimeStats) return null;

  const { name, crimeCount, crimeRate, color } = regionData.properties;
  const stats = crimeStats;

  const getStatusStyle = (status: string) => {
    return status === "Selesai"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-0 z-[2000]">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <DialogTitle className="text-xl font-semibold text-slate-800">
                {name}
              </DialogTitle>
            </div>
            <Badge
              className="px-3 py-1"
              style={{ backgroundColor: `${color}20`, color: color }}
            >
              {crimeRate}
            </Badge>
          </div>
          <DialogDescription className="text-slate-500 mt-2">
            Statistik kriminalitas wilayah {name}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-800">
                {stats.totalCases}
              </div>
              <div className="text-xs text-slate-500 mt-1">Total Kasus</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.solved}
              </div>
              <div className="text-xs text-emerald-600 mt-1">Selesai</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {stats.pending}
              </div>
              <div className="text-xs text-amber-600 mt-1">Dalam Proses</div>
            </div>
          </div>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="chart" className="text-sm">
                Grafik Jenis
              </TabsTrigger>
              <TabsTrigger value="trend" className="text-sm">
                Tren Bulanan
              </TabsTrigger>
              <TabsTrigger value="cases" className="text-sm">
                Kasus Terbaru
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Distribusi Kasus
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.byType} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11 }}
                        width={70}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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

                {/* Pie Chart */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Proporsi Jenis
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.byType}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
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
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {stats.byType.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-xs text-slate-500">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trend" className="mt-0">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Tren Kasus per Bulan (2025)
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cases"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#7c3aed" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="cases" className="mt-0">
              <div className="space-y-3">
                {stats.recentCases.map((crime: any, index: number) => (
                  <div
                    key={crime.id}
                    className="bg-slate-50 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <span className="text-lg font-bold text-slate-400">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">
                          {crime.type}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {crime.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusStyle(crime.status)}`}>
                        {crime.status}
                      </Badge>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(crime.date).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegionModal;
