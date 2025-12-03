"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Shield,
  FileCheck,
  Clock,
} from "lucide-react";

interface OverallStats {
  totalCases: number;
  solvedCases: number;
  pendingCases: number;
  clearanceRate: number;
  districtData: any[];
  topCrimeTypes: any[];
  hotspots: any[];
  recentIncidents: any[];
}

interface StatCardsProps {
  stats: OverallStats;
}

const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-emerald-500" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const cards = [
    {
      title: "Total Kasus",
      value: stats.totalCases,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "from-rose-500 to-rose-600",
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      title: "Kasus Selesai",
      value: stats.solvedCases,
      icon: <FileCheck className="w-5 h-5" />,
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Dalam Proses",
      value: stats.pendingCases,
      icon: <Clock className="w-5 h-5" />,
      color: "from-amber-500 to-amber-600",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Clearance Rate",
      value: `${stats.clearanceRate}%`,
      icon: <Shield className="w-5 h-5" />,
      color: "from-sky-500 to-sky-600",
      textColor: "text-sky-600",
      bgColor: "bg-sky-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <div className={card.textColor}>{card.icon}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;
