"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, TrendingUp, TrendingDown, Minus, Flame, Loader2 } from "lucide-react";

interface Hotspot {
  area: string;
  cases: number;
  trend: string;
  avgSeverity?: number;
}

const HotspotCard: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalHotspots, setTotalHotspots] = useState(0);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/hotspots');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setHotspots(data);
        setTotalHotspots(data.reduce((sum: number, spot: Hotspot) => sum + spot.cases, 0));
        setError(null);
      } catch (err) {
        console.error('Error fetching hotspots:', err);
        setError('Gagal memuat data hotspot');
        setHotspots([]);
        setTotalHotspots(0);
      } finally {
        setLoading(false);
      }
    };

    fetchHotspots();
    
    // Refresh data setiap 45 detik
    const interval = setInterval(fetchHotspots, 45000);
    return () => clearInterval(interval);
  }, []);

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

  const getTrendText = (trend: string) => {
    switch (trend) {
      case "up":
        return "Naik";
      case "down":
        return "Turun";
      default:
        return "Stabil";
    }
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-red-500 text-white";
    if (index === 1) return "bg-orange-500 text-white";
    if (index === 2) return "bg-amber-500 text-white";
    return "bg-slate-200 text-slate-600";
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 3) return "text-red-600";
    if (severity >= 2) return "text-orange-600";
    if (severity >= 1) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Top Hotspot Kriminalitas
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
            <Flame className="w-4 h-4 text-orange-500" />
            Top Hotspot Kriminalitas
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

  if (hotspots.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Top Hotspot Kriminalitas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Flame className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Belum ada data hotspot</p>
            <p className="text-xs text-slate-400 mt-1">Tidak ada kejadian kriminal yang tercatat</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Top Hotspot Kriminalitas
          </CardTitle>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {totalHotspots} total kasus
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
        <div className="space-y-2.5">
          {hotspots.map((spot, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span
                  className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${getRankColor(
                    index
                  )}`}
                >
                  {index + 1}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {spot.area}
                    </span>
                  </div>
                  {/* {spot.avgSeverity && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-slate-500">Tingkat Severity:</span>
                      <span className={`text-xs font-medium ${getSeverityColor(spot.avgSeverity)}`}>
                        {spot.avgSeverity.toFixed(1)}
                      </span>
                    </div>
                  )} */}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {spot.cases} kasus
                  </span>
                  {/* <div className="flex items-center gap-1">
                    {getTrendIcon(spot.trend)}
                    <span className="text-xs text-slate-500">{getTrendText(spot.trend)}</span>
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Statistik tambahan */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-red-50 p-2 rounded">
              <div className="font-medium text-red-700">Area Paling Rawan</div>
              <div className="font-bold text-red-800">{hotspots[0]?.area || '-'}</div>
              <div className="text-red-600">{hotspots[0]?.cases || 0} kasus</div>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <div className="font-medium text-slate-700">Total Area</div>
              <div className="font-bold text-slate-800">{hotspots.length}</div>
              <div className="text-slate-600">area terpantau</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotspotCard;