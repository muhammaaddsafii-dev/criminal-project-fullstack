// lib/api/crime.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface JenisKejahatan {
  id: number;
  nama_jenis_kejahatan: string;
  deskripsi?: string;
}

export interface NamaKejahatan {
  id: number;
  nama: string;
  jenis_kejahatan: number;
  jenis_kejahatan_nama: string;
}

export interface Kecamatan {
  id: number;
  nama: string;
  deskripsi?: string;
}

export interface Desa {
  id: number;
  nama: string;
  kecamatan: number;
  kecamatan_nama: string;
}

export interface Status {
  id: number;
  nama: string;
}

export interface FotoLaporanKejahatan {
  id: number;
  file_path: string;
  file_name: string;
  created_at: string;
  updated_at: string;
  laporan_kejahatan: number;
}

export interface LaporanKejahatan {
  id: number;
  nama_pelapor: string;
  jenis_kejahatan: number;
  nama_kejahatan: number;
  jenis_kejahatan_nama: string;
  nama_kejahatan_nama: string;
  tanggal_kejadian: string;
  waktu_kejadian: string;
  kecamatan: number;
  desa: number;
  kecamatan_nama: string;
  desa_nama: string;
  alamat: string;
  deskripsi: string;
  status: number;
  status_nama: string;
  lokasi?: string;
  is_approval: boolean;
  foto: FotoLaporanKejahatan[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateLaporanKejahatanData {
  nama_pelapor: string;
  jenis_kejahatan: number;
  nama_kejahatan: number;
  tanggal_kejadian: string;
  waktu_kejadian: string;
  kecamatan: number;
  desa: number;
  alamat: string;
  deskripsi: string;
  status: number;
  longitude?: number;
  latitude?: number;
}

// Helper function to handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ✅ PERBAIKAN: Helper function untuk fetch semua pages (pagination)
const fetchAllPages = async <T>(url: string): Promise<T[]> => {
  const allResults: T[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data = await handleResponse(response);
    
    // Jika response adalah paginated
    if (data.results && Array.isArray(data.results)) {
      allResults.push(...data.results);
      nextUrl = data.next;
    } else if (Array.isArray(data)) {
      // Jika response langsung array (non-paginated)
      allResults.push(...data);
      nextUrl = null;
    } else {
      // Response format tidak dikenali
      nextUrl = null;
    }
  }

  return allResults;
};

// ✅ DIPERBAIKI: Jenis Kejahatan APIs - Fetch semua data
export const getJenisKejahatan = async (): Promise<JenisKejahatan[]> => {
  return fetchAllPages<JenisKejahatan>(`${API_BASE_URL}/jenis-kejahatan/`);
};

// ✅ DIPERBAIKI: Nama Kejahatan APIs - Fetch semua data
export const getNamaKejahatan = async (jenisKejahatanId?: number): Promise<NamaKejahatan[]> => {
  const url = jenisKejahatanId 
    ? `${API_BASE_URL}/nama-kejahatan/?jenis_kejahatan_id=${jenisKejahatanId}`
    : `${API_BASE_URL}/nama-kejahatan/`;
  return fetchAllPages<NamaKejahatan>(url);
};

// ✅ DIPERBAIKI: Kecamatan APIs - Fetch semua data
export const getKecamatan = async (): Promise<Kecamatan[]> => {
  return fetchAllPages<Kecamatan>(`${API_BASE_URL}/kecamatan/`);
};

// ✅ DIPERBAIKI: Desa APIs - Fetch semua data
export const getDesa = async (kecamatanId?: number): Promise<Desa[]> => {
  const url = kecamatanId 
    ? `${API_BASE_URL}/desa/?kecamatan_id=${kecamatanId}`
    : `${API_BASE_URL}/desa/`;
  return fetchAllPages<Desa>(url);
};

// ✅ DIPERBAIKI: Status APIs - Fetch semua data
export const getStatus = async (): Promise<Status[]> => {
  return fetchAllPages<Status>(`${API_BASE_URL}/status/`);
};

// Laporan Kejahatan APIs (ini tetap paginated karena memang butuh pagination di UI)
export const getLaporanKejahatan = async (
  params?: {
    page?: number;
    search?: string;
    status_id?: number;
    jenis_kejahatan_id?: number;
    kecamatan_id?: number;
    desa_id?: number;
    is_approval?: boolean;
  }
): Promise<PaginatedResponse<LaporanKejahatan>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status_id) queryParams.append('status_id', params.status_id.toString());
  if (params?.jenis_kejahatan_id) queryParams.append('jenis_kejahatan_id', params.jenis_kejahatan_id.toString());
  if (params?.kecamatan_id) queryParams.append('kecamatan_id', params.kecamatan_id.toString());
  if (params?.desa_id) queryParams.append('desa_id', params.desa_id.toString());
  if (params?.is_approval !== undefined) queryParams.append('is_approval', params.is_approval.toString());
  
  const url = `${API_BASE_URL}/laporan-kejahatan/?${queryParams.toString()}`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const getLaporanKejahatanById = async (id: number): Promise<LaporanKejahatan> => {
  const response = await fetch(`${API_BASE_URL}/laporan-kejahatan/${id}/`);
  return handleResponse(response);
};

export const createLaporanKejahatan = async (
  data: CreateLaporanKejahatanData,
  photos: { file: File; fileName: string }[]
): Promise<LaporanKejahatan> => {
  // First, create the laporan
  const response = await fetch(`${API_BASE_URL}/laporan-kejahatan/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const laporan = await handleResponse(response);
  
  // Then upload photos if any
  if (photos.length > 0) {
    await Promise.all(
      photos.map((photo) => uploadPhoto(laporan.id, photo.file, photo.fileName))
    );
  }
  
  // Fetch the updated laporan with photos
  return getLaporanKejahatanById(laporan.id);
};

export const updateLaporanKejahatan = async (
  id: number,
  data: Partial<CreateLaporanKejahatanData>
): Promise<LaporanKejahatan> => {
  const response = await fetch(`${API_BASE_URL}/laporan-kejahatan/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteLaporanKejahatan = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/laporan-kejahatan/${id}/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const approveLaporanKejahatan = async (id: number): Promise<LaporanKejahatan> => {
  const response = await fetch(`${API_BASE_URL}/laporan-kejahatan/${id}/approve/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

export const toggleApprovalLaporanKejahatan = async (id: number, isApproval: boolean): Promise<LaporanKejahatan> => {
  // If setting to approved, use approve endpoint
  if (isApproval) {
    return approveLaporanKejahatan(id);
  }
  
  // If setting to not approved, use update endpoint
  const response = await fetch(`${API_BASE_URL}/laporan-kejahatan/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_approval: false }),
  });
  return handleResponse(response);
};

// Photo APIs
export const uploadPhoto = async (
  laporanId: number,
  file: File,
  fileName: string
): Promise<FotoLaporanKejahatan> => {
  const formData = new FormData();
  formData.append('laporan_kejahatan', laporanId.toString());
  formData.append('file_path', file);
  formData.append('file_name', fileName);
  
  const response = await fetch(`${API_BASE_URL}/foto-laporan-kejahatan/`, {
    method: 'POST',
    body: formData,
  });
  
  return handleResponse(response);
};

export const deletePhoto = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/foto-laporan-kejahatan/${id}/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};