"use client";

import React, { useState } from "react";
import StatCards from "@/components/StatCards";
import HotspotCard from "@/components/HotspotCard";
import RecentIncidents from "@/components/RecentIncidents";
import TopCrimeTypes from "@/components/TopCrimeTypes";
import DistrictCrimeChart from "@/components/DistrictCrimeChart";
// HAPUS baris ini:
// import CrimeMap from "@/components/CrimeMap";
import RegionModal from "../components/RegionModal";
import CrimeTable from "@/components/CrimeTable";
import {
  geoJsonData,
  crimeStatsByDistrict,
  overallStats,
  crimeTableData,
} from "@/data/mockData";
import { MapPin, Shield } from "lucide-react";

// TAMBAHKAN baris ini untuk dynamic import
import dynamic from "next/dynamic";

const CrimeMap = dynamic(() => import("@/components/CrimeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Memuat peta...</p>
    </div>
  ),
});

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegionClick = (region: any) => {
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Sistem Informasi Kriminalitas</h1>
              <p className="text-blue-100 text-sm mt-1">
                Dashboard Monitoring & Analisis Data Kriminalitas Jakarta
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <StatCards stats={overallStats} />

        {/* Map and Hotspots */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Peta Kriminalitas
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Klik pada wilayah untuk melihat detail statistik
              </p>
              <CrimeMap stats={overallStats} />
            </div>
          </div>
          <div>
            <HotspotCard hotspots={overallStats.hotspots} />
          </div>
        </div>

        {/* Charts and Recent Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DistrictCrimeChart data={overallStats.districtData} />
          <TopCrimeTypes data={overallStats.topCrimeTypes} />
        </div>

        <div className="mb-8">
          <RecentIncidents incidents={overallStats.recentIncidents} />
        </div>

        {/* Crime Table */}
        <CrimeTable data={crimeTableData} />
      </main>

      {/* Modal */}
      {selectedRegion && (
        <RegionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          region={selectedRegion}
          stats={crimeStatsByDistrict[selectedRegion.id]}
        />
      )}
    </div>
  );
}
