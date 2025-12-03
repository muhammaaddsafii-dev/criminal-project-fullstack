"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "bg-red-100 text-red-700";
      case "down":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-200">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
          <Flame className="mr-2 h-5 w-5 text-orange-600" />
          Hotspot Area
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {hotspots.map((hotspot, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">
                  {hotspot.area}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {hotspot.cases} kasus
                </p>
              </div>
              <Badge
                variant="secondary"
                className={`${getTrendColor(hotspot.trend)} flex items-center gap-1`}
              >
                {getTrendIcon(hotspot.trend)}
                <span className="capitalize">{hotspot.trend}</span>
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HotspotCard;
