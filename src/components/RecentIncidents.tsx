"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

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
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      default:
        return "Rendah";
    }
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-blue-600" />
          Insiden Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">
                  {incident.title}
                </h3>
                <Badge
                  variant="secondary"
                  className={`${getSeverityColor(incident.severity)} ml-2`}
                >
                  {getSeverityText(incident.severity)}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  <span>{incident.location}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  <span>
                    {new Date(incident.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
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
