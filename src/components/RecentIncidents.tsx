"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Calendar, Loader2 } from "lucide-react";

interface Incident {
  id: number;
  title: string;
  location: string;
  date: string;
  type: string;
  severity: string;
}

const RecentIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentIncidents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/recent-incidents');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format severity untuk kompatibilitas dengan komponen existing
        const formattedData = data.map((incident: any) => ({
          ...incident,
          severity: mapSeverityLevel(incident.severity)
        }));
        
        setIncidents(formattedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent incidents:', err);
        setError('Gagal memuat data insiden terbaru');
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentIncidents();
    
    // Refresh data setiap 30 detik untuk data real-time
    const interval = setInterval(fetchRecentIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  // Map severity level dari database ke format yang digunakan komponen
  const mapSeverityLevel = (severity: string): string => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL':
        return 'high';
      case 'MEDIUM':
        return 'medium';
      case 'LOW':
        return 'low';
      default:
        return 'medium';
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "high":
        return "Kritis";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return "Sedang";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Pencurian":
        return "bg-blue-100 text-blue-700";
      case "Perampokan":
        return "bg-red-100 text-red-700";
      case "Penipuan":
        return "bg-purple-100 text-purple-700";
      case "Kekerasan":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Insiden Terbaru
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
            <Bell className="w-4 h-4 text-amber-500" />
            Insiden Terbaru
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

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Insiden Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
        {incidents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-500">Tidak ada data insiden</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                {/* Header with Title and Severity */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium text-slate-800 leading-tight flex-1 line-clamp-2">
                    {incident.title || `Laporan #${incident.id}`}
                  </h4>
                  <Badge
                    className={`text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0 ${getSeverityStyle(
                      incident.severity
                    )}`}
                  >
                    {getSeverityLabel(incident.severity)}
                  </Badge>
                </div>

                {/* Type Badge */}
                <div className="mb-2">
                  <Badge
                    className={`text-xs px-2 py-0.5 ${getTypeColor(
                      incident.type
                    )}`}
                  >
                    {incident.type}
                  </Badge>
                </div>

                {/* Location and Date Info */}
                <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {incident.location || "Lokasi tidak tersedia"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {new Date(incident.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentIncidents;