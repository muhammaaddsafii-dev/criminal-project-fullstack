"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface CrimeType {
  type: string;
  count: number;
  percentage: number;
}

interface TopCrimeTypesProps {
  data: CrimeType[];
}

const TopCrimeTypes: React.FC<TopCrimeTypesProps> = ({ data }) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-slate-500",
  ];

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
          Jenis Kriminalitas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  {item.type}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className={`${colors[index % colors.length]} h-2.5 rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopCrimeTypes;
