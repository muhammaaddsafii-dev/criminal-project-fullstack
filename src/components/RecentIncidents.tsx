"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Calendar } from "lucide-react";

interface Incident {
  id: number;
  title: string;
  location: string;
  date: string;
  type: string;
  severity: string;
}

interface RecentIncidentsProps {
  incidents: Incident[];
}

const RecentIncidents: React.FC<RecentIncidentsProps> = ({ incidents }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
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

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Insiden Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-2">
        <div className="space-y-2.5">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              {/* Header with Title and Severity */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium text-slate-800 leading-tight flex-1 line-clamp-2">
                  {incident.title}
                </h4>
                <Badge
                  className={`text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0 ${getSeverityStyle(
                    incident.severity
                  )}`}
                >
                  {incident.severity === "high" ? "Berat" : "Sedang"}
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
                  <span className="truncate">{incident.location}</span>
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
      </CardContent>
    </Card>
  );
};

export default RecentIncidents;
