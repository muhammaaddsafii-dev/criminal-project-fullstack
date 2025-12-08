// app/dashboard/page.tsx - Tambahkan import dan button Back
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"; // Tambahkan import Link
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    MapPin,
    X,
    Save,
    Loader2,
    AlertCircle,
    ArrowLeft, // Tambahkan ArrowLeft icon
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import dynamic from "next/dynamic";

const MapPicker = dynamic(
    () => import("../../components/MapPicker"),
    {
        ssr: false,
        loading: () => (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Memuat peta...</p>
            </div>
        ),
    }
);

interface CrimeIncident {
    id: number;
    incident_code: string;
    area_id: number;
    location: { lat: number; lng: number };
    address: string;
    incident_date: string;
    incident_time: string;
    type_id: number;
    severity_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    area_name?: string;
    type_name?: string;
}

interface Area {
    id: number;
    name: string;
}

interface CrimeType {
    id: number;
    name: string;
    description: string;
}

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

export default function DashboardPage() {
    const [incidents, setIncidents] = useState<CrimeIncident[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [types, setTypes] = useState<CrimeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIncident, setEditingIncident] = useState<CrimeIncident | null>(null);
    const [formData, setFormData] = useState({
        incident_code: "",
        area_id: "",
        address: "",
        incident_date: new Date().toISOString().split("T")[0],
        incident_time: new Date().toTimeString().slice(0, 5),
        type_id: "",
        severity_level: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        description: "",
    });
    const [location, setLocation] = useState<Location | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch data
    const fetchIncidents = async () => {
        try {
            const response = await fetch("/api/crime-incidents");
            const data = await response.json();
            setIncidents(data);
        } catch (error) {
            console.error("Error fetching incidents:", error);
            setError("Gagal memuat data insiden");
        } finally {
            setLoading(false);
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await fetch("/api/areas");
            const data = await response.json();
            setAreas(data);
        } catch (error) {
            console.error("Error fetching areas:", error);
        }
    };

    const fetchTypes = async () => {
        try {
            const response = await fetch("/api/types");
            const data = await response.json();
            setTypes(data);
        } catch (error) {
            console.error("Error fetching types:", error);
        }
    };

    useEffect(() => {
        fetchIncidents();
        fetchAreas();
        fetchTypes();
    }, []);

    // Filter incidents based on search
    const filteredIncidents = incidents.filter(
        (incident) =>
            incident.incident_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.area_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setEditingIncident(null);
        setFormData({
            incident_code: "",
            area_id: "",
            address: "",
            incident_date: new Date().toISOString().split("T")[0],
            incident_time: new Date().toTimeString().slice(0, 5),
            type_id: "",
            severity_level: "MEDIUM",
            description: "",
        });
        setLocation(null);
        setError(null);
        setDialogOpen(true);
    };

    const handleEdit = (incident: CrimeIncident) => {
        setEditingIncident(incident);
        setFormData({
            incident_code: incident.incident_code,
            area_id: incident.area_id.toString(),
            address: incident.address,
            incident_date: incident.incident_date,
            incident_time: incident.incident_time || "",
            type_id: incident.type_id.toString(),
            severity_level: incident.severity_level,
            description: incident.description || "",
        });

        // Perbaikan: Pastikan location ada dan valid
        if (incident.location &&
            incident.location.lat !== undefined &&
            incident.location.lng !== undefined) {
            setLocation({
                lat: incident.location.lat,
                lng: incident.location.lng
            });
        } else {
            setLocation(null);
        }

        setError(null);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus insiden ini?")) return;

        try {
            const response = await fetch(`/api/crime-incidents/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchIncidents();
            } else {
                throw new Error("Gagal menghapus insiden");
            }
        } catch (error) {
            console.error("Error deleting incident:", error);
            setError("Gagal menghapus insiden");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            // Validasi
            if (!location) {
                throw new Error("Silakan pilih lokasi di peta");
            }

            const payload = {
                ...formData,
                area_id: parseInt(formData.area_id),
                type_id: parseInt(formData.type_id),
                location: {
                    lat: location.lat,
                    lng: location.lng,
                },
            };

            const url = editingIncident
                ? `/api/crime-incidents/${editingIncident.id}`
                : "/api/crime-incidents";

            const method = editingIncident ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Terjadi kesalahan");
            }

            // Refresh data
            fetchIncidents();
            setDialogOpen(false);
            setShowMap(false);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const getSeverityStyle = (severity: string) => {
        switch (severity) {
            case "LOW":
                return "bg-green-100 text-green-800";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800";
            case "HIGH":
                return "bg-orange-100 text-orange-800";
            case "CRITICAL":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        };
    };

    const getSeverityLabel = (severity: string) => {
        switch (severity) {
            case "LOW":
                return "Rendah";
            case "MEDIUM":
                return "Sedang";
            case "HIGH":
                return "Tinggi";
            case "CRITICAL":
                return "Kritis";
            default:
                return severity;
        };
    };

    // Fungsi untuk mendapatkan lokasi saat ini
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({
                        lat: latitude,
                        lng: longitude,
                    });
                    // Reverse geocode untuk mendapatkan alamat (bisa ditambahkan nanti)
                    console.log("Current location:", latitude, longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setError("Tidak dapat mendapatkan lokasi GPS");
                }
            );
        } else {
            setError("Browser tidak mendukung geolocation");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header dengan Back Button */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* Back Button */}
                            <Link href="/">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Kembali ke Landing Page</span>
                                    <span className="sm:hidden">Kembali</span>
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Optional: Tambahkan statistik atau info tambahan di sini jika perlu */}
                        <div className="text-sm text-slate-500 hidden md:block">
                            Total Insiden: {incidents.length}
                        </div>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                        Dashboard CRUD Insiden Kriminal
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Kelola data insiden kriminal dengan fitur pemetaan
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Search and Create */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Cari kode insiden, alamat, atau wilayah..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Insiden Baru
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Data Insiden Kriminal</CardTitle>
                            <div className="text-sm text-slate-500">
                                {filteredIncidents.length} dari {incidents.length} data
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode Insiden</TableHead>
                                            <TableHead>Wilayah</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Alamat</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Severity</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredIncidents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p className="text-slate-500">Tidak ada data ditemukan</p>
                                                        <p className="text-sm text-slate-400">
                                                            {searchTerm ? 'Coba dengan kata kunci lain' : 'Tambah data baru untuk memulai'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredIncidents.map((incident) => (
                                                <TableRow key={incident.id}>
                                                    <TableCell className="font-medium">
                                                        <span className="font-mono text-sm">{incident.incident_code}</span>
                                                    </TableCell>
                                                    <TableCell>{incident.area_name}</TableCell>
                                                    <TableCell>{incident.type_name}</TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {incident.address}
                                                    </TableCell>
                                                    <TableCell>{incident.incident_date}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="secondary"
                                                            className={getSeverityStyle(incident.severity_level)}
                                                        >
                                                            {getSeverityLabel(incident.severity_level)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(incident)}
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDelete(incident.id)}
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Form */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle>
                                {editingIncident ? "Edit Insiden" : "Tambah Insiden Baru"}
                            </DialogTitle>
                            {editingIncident && (
                                <div className="text-sm text-slate-500">
                                    ID: {editingIncident.id}
                                </div>
                            )}
                        </div>
                        <DialogDescription>
                            Isi form di bawah ini. Gunakan peta untuk memilih lokasi insiden.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="form" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="form">Form Data</TabsTrigger>
                            <TabsTrigger value="map">Pilih Lokasi</TabsTrigger>
                        </TabsList>

                        <TabsContent value="form" className="space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="incident_code">Kode Insiden *</Label>
                                        <Input
                                            id="incident_code"
                                            value={formData.incident_code}
                                            onChange={(e) =>
                                                setFormData({ ...formData, incident_code: e.target.value })
                                            }
                                            placeholder="CT-2024-001"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="area_id">Wilayah *</Label>
                                        <Select
                                            value={formData.area_id}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, area_id: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih wilayah" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {areas.map((area) => (
                                                    <SelectItem key={area.id} value={area.id.toString()}>
                                                        {area.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type_id">Jenis Kejahatan *</Label>
                                        <Select
                                            value={formData.type_id}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, type_id: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {types.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="severity_level">Tingkat Keparahan</Label>
                                        <Select
                                            value={formData.severity_level}
                                            onValueChange={(value: any) =>
                                                setFormData({ ...formData, severity_level: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Rendah</SelectItem>
                                                <SelectItem value="MEDIUM">Sedang</SelectItem>
                                                <SelectItem value="HIGH">Tinggi</SelectItem>
                                                <SelectItem value="CRITICAL">Kritis</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="incident_date">Tanggal Insiden *</Label>
                                        <Input
                                            id="incident_date"
                                            type="date"
                                            value={formData.incident_date}
                                            onChange={(e) =>
                                                setFormData({ ...formData, incident_date: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="incident_time">Waktu Insiden</Label>
                                        <Input
                                            id="incident_time"
                                            type="time"
                                            value={formData.incident_time}
                                            onChange={(e) =>
                                                setFormData({ ...formData, incident_time: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Alamat Lengkap *</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address: e.target.value })
                                        }
                                        placeholder="Jalan ... No. ... RT/RW ..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi Insiden</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Deskripsi detail kejadian..."
                                        rows={4}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-slate-600" />
                                        <div>
                                            <p className="font-medium">Lokasi yang dipilih:</p>
                                            {location ? (
                                                <p className="text-sm text-slate-600">
                                                    Lat: {location?.lat?.toFixed(6) || 'N/A'}, Lng: {location?.lng?.toFixed(6) || 'N/A'}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-500">
                                                    Belum memilih lokasi
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={getCurrentLocation}
                                            size="sm"
                                        >
                                            Gunakan GPS
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowMap(true)}
                                            size="sm"
                                        >
                                            Pilih di Peta
                                        </Button>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingIncident ? "Update" : "Simpan"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </TabsContent>

                        <TabsContent value="map" className="h-[500px]">
                            <div className="relative h-full border rounded-lg overflow-hidden">
                                <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-md">
                                    <p className="text-sm font-medium mb-2">Pilih lokasi di peta:</p>
                                    <p className="text-xs text-slate-600">
                                        Klik di peta untuk menandai lokasi insiden
                                    </p>
                                </div>
                                <MapPicker
                                    center={[-2.3051, 121.6014]} // Morowali
                                    zoom={12}
                                    onLocationSelect={setLocation}
                                    selectedLocation={location}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="absolute bottom-4 right-4 z-10"
                                    onClick={() => setShowMap(false)}
                                >
                                    Selesai
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Footer dengan link kembali */}
            <div className="mt-8 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-center">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Landing Page
                        </Button>
                    </Link>
                </div>
                <p className="text-center text-sm text-slate-500 mt-2">
                    © 2025 Crime Dashboard - Morowali
                </p>
            </div>
        </div>
    );
}