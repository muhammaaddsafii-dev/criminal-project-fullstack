"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { X, MapPin, TrendingUp, CheckCircle, Clock } from "lucide-react";

interface RegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: {
    id: number;
    name: string;
    crimeCount: number;
    crimeRate: string;
  };
  stats: {
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
  };
}

const RegionModal: React.FC<RegionModalProps> = ({
  isOpen,
  onClose,
  region,
  stats,
}) => {
  const COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#64748b"];

  const getRateColor = (rate: string) => {
    switch (rate) {
      case "Tinggi":
        return "bg-red-100 text-red-700";
      case "Sedang":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-emerald-100 text-emerald-700";
    }
  };

  const getStatusStyle = (status: string) => {
    return status === "Selesai"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-blue-600" />
              {region.name}
            </DialogTitle>
            <Badge variant="secondary" className={`${getRateColor(region.crimeRate)} text-sm`}>
              {region.crimeRate}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Total Kasus
                  </p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {stats.totalCases}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">
                    Terselesaikan
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {stats.solved}
                  </p>
                </div>
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">
                    Dalam Proses
                  </p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    {stats.pending}
                  </p>
                </div>
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Distribusi Jenis Kriminalitas
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.byType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.byType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Tren Bulanan
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Cases */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Kasus Terbaru
            </h3>
            <div className="space-y-3">
              {stats.recentCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">
                        {caseItem.type}
                      </span>
                      <Badge
                        variant="secondary"
                        className={getStatusStyle(caseItem.status)}
                      >
                        {caseItem.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {caseItem.location}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(caseItem.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegionModal;
