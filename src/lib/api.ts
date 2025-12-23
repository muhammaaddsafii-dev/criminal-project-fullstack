// lib/api.ts - Centralized API Helper Functions
// Untuk mempermudah API calls dari komponen

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

// API Endpoints
export const API_ENDPOINTS = {
  laporanKejahatan: `${API_BASE_URL}/api/laporan-kejahatan/`,
  jenisKejahatan: `${API_BASE_URL}/api/jenis-kejahatan/`,
  namaKejahatan: `${API_BASE_URL}/api/nama-kejahatan/`,
  kecamatan: `${API_BASE_URL}/api/kecamatan/`,
  desa: `${API_BASE_URL}/api/desa/`,
  status: `${API_BASE_URL}/api/status/`,
  posKeamanan: `${API_BASE_URL}/api/pos-keamanan/`,
  cctv: `${API_BASE_URL}/api/cctv/`,
  kejadianLainnya: `${API_BASE_URL}/api/kejadian-lainnya/`,
  statistik: `${API_BASE_URL}/api/statistik/`,
  statistikDashboard: `${API_BASE_URL}/api/statistik/`,
};

// Types
export interface LaporanKejahatan {
  id: number;
  nama_pelapor: string;
  jenis_kejahatan: number;
  jenis_kejahatan_nama: string;
  nama_kejahatan: number;
  nama_kejahatan_nama: string;
  tanggal_kejadian: string;
  waktu_kejadian: string;
  kecamatan: number;
  kecamatan_nama: string;
  desa: number;
  desa_nama: string;
  alamat: string;
  deskripsi: string;
  status: number;
  status_nama: string;
  lokasi: string;
  is_approval: boolean;
  created_at: string;
  updated_at: string;
  foto: FotoLaporan[];
}

export interface FotoLaporan {
  id: number;
  file_path: string;
  file_name: string;
  created_at: string;
  updated_at: string;
  laporan_kejahatan: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Generic fetch function
export async function fetchFromAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Fetch all pages automatically
export async function fetchAllPages<T>(
  initialUrl: string
): Promise<T[]> {
  let allResults: T[] = [];
  let nextUrl: string | null = initialUrl;

  while (nextUrl) {
    const response: PaginatedResponse<T> = await fetchFromAPI<PaginatedResponse<T>>(nextUrl);
    allResults = [...allResults, ...response.results];
    nextUrl = response.next;
  }

  return allResults;
}

// Specific API functions
export const crimeAPI = {
  // Get recent incidents (approved only)
  getRecentIncidents: async (limit: number = 5) => {
    const url = `${API_ENDPOINTS.laporanKejahatan}?is_approval=true&ordering=-tanggal_kejadian,-waktu_kejadian`;
    const response = await fetchFromAPI<PaginatedResponse<LaporanKejahatan>>(url);
    return response.results.slice(0, limit);
  },

  // Get all approved incidents with pagination handling
  getAllApprovedIncidents: async () => {
    const url = `${API_ENDPOINTS.laporanKejahatan}?is_approval=true`;
    return await fetchAllPages<LaporanKejahatan>(url);
  },

  // Get crime statistics by type
  getCrimeTypeStats: async (limit: number = 5) => {
    const allIncidents = await crimeAPI.getAllApprovedIncidents();
    
    // Group by crime type
    const crimeMap = new Map<string, number>();
    allIncidents.forEach(incident => {
      const type = incident.jenis_kejahatan_nama;
      crimeMap.set(type, (crimeMap.get(type) || 0) + 1);
    });

    // Convert to array and sort
    const total = allIncidents.length;
    return Array.from(crimeMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  // Get district statistics
  getDistrictStats: async (limit: number = 5) => {
    const allIncidents = await crimeAPI.getAllApprovedIncidents();
    
    // Group by district
    const districtMap = new Map<string, {
      count: number;
      types: Map<string, number>;
    }>();

    allIncidents.forEach(incident => {
      const district = incident.desa_nama;
      const crimeType = incident.jenis_kejahatan_nama;

      if (!districtMap.has(district)) {
        districtMap.set(district, {
          count: 0,
          types: new Map()
        });
      }

      const districtData = districtMap.get(district)!;
      districtData.count++;
      districtData.types.set(
        crimeType,
        (districtData.types.get(crimeType) || 0) + 1
      );
    });

    // Convert to array and sort
    return Array.from(districtMap.entries())
      .map(([name, data]) => {
        const details: { [key: string]: number } = {};
        data.types.forEach((count, type) => {
          details[type] = count;
        });

        return {
          name,
          total: data.count,
          details
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  },

  // Get dashboard statistics (from backend endpoint)
  getDashboardStats: async () => {
    return await fetchFromAPI<{
      success: boolean;
      message: string;
      data: {
        jumlah_laporan_kejahatan_approved: number;
        jumlah_desa: number;
        jumlah_pos_keamanan: number;
        jumlah_cctv: number;
      };
    }>(API_ENDPOINTS.statistikDashboard);
  },

  // Create new report
  createReport: async (data: Partial<LaporanKejahatan>) => {
    return await fetchFromAPI<LaporanKejahatan>(
      API_ENDPOINTS.laporanKejahatan,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // Update report
  updateReport: async (id: number, data: Partial<LaporanKejahatan>) => {
    return await fetchFromAPI<LaporanKejahatan>(
      `${API_ENDPOINTS.laporanKejahatan}${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  // Approve report
  approveReport: async (id: number) => {
    return await fetchFromAPI<LaporanKejahatan>(
      `${API_ENDPOINTS.laporanKejahatan}${id}/approve/`,
      {
        method: 'POST',
      }
    );
  },

  // Delete report
  deleteReport: async (id: number) => {
    return await fetchFromAPI(
      `${API_ENDPOINTS.laporanKejahatan}${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};

// Master data API functions
export const masterDataAPI = {
  getJenisKejahatan: async () => {
    return await fetchFromAPI<PaginatedResponse<any>>(
      API_ENDPOINTS.jenisKejahatan
    );
  },

  getNamaKejahatan: async (jenisKejahatanId?: number) => {
    const url = jenisKejahatanId
      ? `${API_ENDPOINTS.namaKejahatan}?jenis_kejahatan_id=${jenisKejahatanId}`
      : API_ENDPOINTS.namaKejahatan;
    return await fetchFromAPI<PaginatedResponse<any>>(url);
  },

  getKecamatan: async () => {
    return await fetchFromAPI<PaginatedResponse<any>>(
      API_ENDPOINTS.kecamatan
    );
  },

  getDesa: async (kecamatanId?: number) => {
    const url = kecamatanId
      ? `${API_ENDPOINTS.desa}?kecamatan_id=${kecamatanId}`
      : API_ENDPOINTS.desa;
    return await fetchFromAPI<PaginatedResponse<any>>(url);
  },

  getStatus: async () => {
    return await fetchFromAPI<PaginatedResponse<any>>(
      API_ENDPOINTS.status
    );
  },
};

// Utility functions
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (dateString: string, timeString: string): string => {
  const date = new Date(`${dateString}T${timeString}`);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default crimeAPI;