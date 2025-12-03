"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Activity,
  MapPin,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  bgColor: string;
  color: string;
}

const StatCards = () => {
  const stats: StatCard[] = [
    {
      title: "Total Incidents",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Activity,
      bgColor: "bg-blue-50",
      color: "bg-blue-500",
    },
    {
      title: "High Priority",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      color: "bg-red-500",
    },
    {
      title: "Active Cases",
      value: "428",
      change: "-3.1%",
      trend: "down",
      icon: Users,
      bgColor: "bg-green-50",
      color: "bg-green-500",
    },
    {
      title: "Hotspots",
      value: "12",
      change: "+2",
      trend: "up",
      icon: MapPin,
      bgColor: "bg-purple-50",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
                <p
                  className={`text-sm mt-2 flex items-center gap-1 ${
                    card.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  {card.change} from last month
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`h-8 w-8 ${card.color.replace("bg-", "text-")}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;
