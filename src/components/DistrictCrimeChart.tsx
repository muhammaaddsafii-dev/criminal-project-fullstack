"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
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
}

interface DistrictCrimeChartProps {
  data: DistrictData[];
}

const DistrictCrimeChart: React.FC<DistrictCrimeChartProps> = ({ data }) => {
  // Warna gradient untuk bar chart
  const getBarColor = (index: number) => {
    const colors = [
      "#ef4444", // red-500
      "#f97316", // orange-500
      "#f59e0b", // amber-500
      "#eab308", // yellow-500
      "#84cc16", // lime-500
      "#22c55e", // green-500
    ];
    return colors[index] || "#94a3b8";
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">
            {payload[0].payload.name}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Total:{" "}
            <span className="font-bold text-slate-800">{payload[0].value}</span>{" "}
            kasus
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          Kriminalitas per Wilayah
        </CardTitle>
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
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DistrictCrimeChart;
