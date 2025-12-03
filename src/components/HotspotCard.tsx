"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";

interface Hotspot {
  area: string;
  cases: number;
  trend: string;
}

interface HotspotCardProps {
  hotspots: Hotspot[];
}

const HotspotCard: React.FC<HotspotCardProps> = ({ hotspots }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
      case "down":
        return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-red-500 text-white";
    if (index === 1) return "bg-orange-500 text-white";
    if (index === 2) return "bg-amber-500 text-white";
    return "bg-slate-200 text-slate-600";
  };

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Hotspot Kriminalitas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
        <div className="space-y-2.5">
          {hotspots.map((spot, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span
                  className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${getRankColor(
                    index
                  )}`}
                >
                  {index + 1}
                </span>
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {spot.area}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-800">
                  {spot.cases}
                </span>
                {getTrendIcon(spot.trend)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HotspotCard;
