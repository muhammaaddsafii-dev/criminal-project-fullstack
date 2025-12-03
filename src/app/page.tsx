"use client";

import React, { useState } from "react";
import StatCards from "@/components/StatCards";
import HotspotCard from "@/components/HotspotCard";
import RecentIncidents from "@/components/RecentIncidents";
import TopCrimeTypes from "@/components/TopCrimeTypes";
import DistrictCrimeChart from "@/components/DistrictCrimeChart";
import RegionModal from "@/components/RegionModal";
import CrimeTable from "@/components/CrimeTable";
import {
  geoJsonData,
  crimeStatsByDistrict,
  overallStats,
  crimeTableData,
} from "@/data/mockData";
import { MapPin, Shield } from "lucide-react";
import dynamic from "next/dynamic";

const CrimeMap = dynamic(() => import("@/components/CrimeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Memuat peta...</p>
    </div>
  ),
});

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegionClick = (region: any) => {
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[1000]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-2 bg-slate-900 rounded-lg flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-slate-800 truncate">
                  CrimeWatch Jakarta
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Sistem Visualisasi Kriminalitas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 flex-shrink-0">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">DKI Jakarta, Indonesia</span>
              <span className="sm:hidden">Jakarta</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <StatCards stats={overallStats} />

        {/* Dashboard Grid Layout - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Column - Hotspot & Recent Incidents */}
          <div
            className="lg:col-span-2 grid grid-rows-2 gap-4"
            style={{ height: "750px" }}
          >
            <div className="row-span-1 overflow-hidden">
              <HotspotCard hotspots={overallStats.hotspots} />
            </div>
            <div className="row-span-1 overflow-hidden">
              <RecentIncidents incidents={overallStats.recentIncidents} />
            </div>
          </div>

          {/* Center Column - Map (DIPERBESAR) */}
          <div className="lg:col-span-8" style={{ height: "750px" }}>
            <div className="bg-white rounded-xl shadow-sm p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Peta Kriminalitas
                  </h2>
                  <p className="text-sm text-slate-500">
                    Klik pada wilayah untuk melihat detail statistik
                  </p>
                </div>
              </div>
              <div
                className="rounded-xl overflow-hidden"
                style={{ height: "calc(100% - 60px)" }}
              >
                <CrimeMap
                  geoJsonData={geoJsonData}
                  onRegionClick={handleRegionClick}
                  selectedRegion={selectedRegion}
                />
              </div>
            </div>
          </div>

          {/* Right Column - District Chart & Top Crime Types */}
          <div
            className="lg:col-span-2 grid grid-rows-2 gap-4"
            style={{ height: "750px" }}
          >
            <div className="row-span-1 overflow-hidden">
              <DistrictCrimeChart data={overallStats.districtData} />
            </div>
            <div className="row-span-1 overflow-hidden">
              <TopCrimeTypes crimeTypes={overallStats.topCrimeTypes} />
            </div>
          </div>
        </div>

        {/* Data Table - Full Width Below Map */}
        <CrimeTable data={crimeTableData} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Shield className="w-4 h-4" />
              <span>CrimeWatch Jakarta - Data Dummy untuk Demonstrasi</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2025 Sistem Visualisasi Kriminalitas
            </p>
          </div>
        </div>
      </footer>

      {/* Region Detail Modal */}
      <RegionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        regionData={selectedRegion}
        crimeStats={
          selectedRegion
            ? crimeStatsByDistrict[selectedRegion.properties.id]
            : null
        }
      />
    </div>
  );
}
