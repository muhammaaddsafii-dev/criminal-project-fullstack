"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { MapPin, Shield, Settings, Database } from "lucide-react";
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
      {/* Header - Responsive */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[1000]">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-slate-900 rounded-lg flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-800 truncate">
                  Monitoring Kriminalitas Morowali
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                  Sistem Visualisasi Kriminalitas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-[10px] sm:text-xs md:text-sm text-slate-500 flex-shrink-0">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Morowali, Indonesia</span>
                <span className="md:hidden">Sulawesi Tengah</span>
              </div>
              
              {/* Tambahkan button Dashboard di sini */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors"
              >
                <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">CRUD</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Stats Cards - Responsive */}
        <StatCards stats={overallStats} />

        {/* Dashboard Grid Layout - Responsive untuk semua device */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Left Column - Hotspot & Recent Incidents */}
          {/* Mobile & Tablet: Stack secara horizontal */}
          {/* Desktop: Sidebar kiri (20%) */}
          <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <div className="h-[300px] sm:h-[350px] xl:h-[365px]">
              <HotspotCard/>
            </div>
            <div className="h-[300px] sm:h-[350px] xl:h-[365px]">
              <RecentIncidents />
            </div>
          </div>

          {/* Center Column - Map */}
          {/* Mobile: Full width, tinggi 400px */}
          {/* Tablet: Full width, tinggi 500px */}
          {/* Desktop: 60% width, tinggi 750px */}
          <div className="xl:col-span-6 h-[400px] sm:h-[500px] md:h-[600px] xl:h-[750px]">
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800">
                    Peta Kriminalitas
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Klik pada wilayah untuk detail
                  </p>
                </div>
              </div>
              <div
                className="rounded-xl overflow-hidden"
                style={{ height: "calc(100% - 50px)" }}
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
          {/* Mobile & Tablet: Stack secara horizontal */}
          {/* Desktop: Sidebar kanan (20%) */}
          <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <div className="h-[300px] sm:h-[350px] xl:h-[365px]">
              <DistrictCrimeChart />
            </div>
            <div className="h-[300px] sm:h-[350px] xl:h-[365px]">
              <TopCrimeTypes />
            </div>
          </div>
        </div>

        {/* Data Table - Full Width, Responsive */}
        <CrimeTable/>
      </main>

      {/* Footer - Responsive */}
      <footer className="bg-white border-t border-slate-200 mt-6 sm:mt-8">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-center sm:text-left">
                CrimeWatch Morowali - Data Dummy untuk Demonstrasi
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
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
