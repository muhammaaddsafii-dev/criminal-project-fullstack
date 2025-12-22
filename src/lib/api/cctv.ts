// lib/api/cctv.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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

export interface FotoCCTV {
  id: number;
  file_path: string;
  file_name: string;
  created_at: string;
  updated_at: string;
  cctv: number;
}

export interface CCTV {
  id: number;
  nama_lokasi: string;
  kecamatan: number;
  desa: number;
  kecamatan_nama: string;
  desa_nama: string;
  deskripsi?: string;
  url_cctv?: string;
  lokasi?: string;
  foto: FotoCCTV[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateCCTVData {
  nama_lokasi: string;
  kecamatan: number;
  desa: number;
  deskripsi?: string;
  url_cctv?: string;
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

// Kecamatan APIs
export const getKecamatan = async (): Promise<Kecamatan[]> => {
  const response = await fetch(`${API_BASE_URL}/kecamatan/`);
  const data = await handleResponse(response);
  return data.results || data;
};

// Desa APIs
export const getDesa = async (kecamatanId?: number): Promise<Desa[]> => {
  const url = kecamatanId
    ? `${API_BASE_URL}/desa/?kecamatan_id=${kecamatanId}`
    : `${API_BASE_URL}/desa/`;
  const response = await fetch(url);
  const data = await handleResponse(response);
  return data.results || data;
};

// CCTV APIs
export const getCCTV = async (
  params?: {
    page?: number;
    search?: string;
    kecamatan_id?: number;
    desa_id?: number;
  }
): Promise<PaginatedResponse<CCTV>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.kecamatan_id) queryParams.append('kecamatan_id', params.kecamatan_id.toString());
  if (params?.desa_id) queryParams.append('desa_id', params.desa_id.toString());

  const url = `${API_BASE_URL}/cctv/?${queryParams.toString()}`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const getCCTVById = async (id: number): Promise<CCTV> => {
  const response = await fetch(`${API_BASE_URL}/cctv/${id}/`);
  return handleResponse(response);
};

export const createCCTV = async (
  data: CreateCCTVData,
  photos: { file: File; fileName: string }[]
): Promise<CCTV> => {
  // First, create the CCTV
  const response = await fetch(`${API_BASE_URL}/cctv/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const cctv = await handleResponse(response);

  // Then upload photos if any
  if (photos.length > 0) {
    await Promise.all(
      photos.map((photo) => uploadCCTVPhoto(cctv.id, photo.file, photo.fileName))
    );
  }

  // Fetch the updated CCTV with photos
  return getCCTVById(cctv.id);
};

export const updateCCTV = async (
  id: number,
  data: Partial<CreateCCTVData>
): Promise<CCTV> => {
  const response = await fetch(`${API_BASE_URL}/cctv/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCCTV = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/cctv/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// Photo APIs
export const uploadCCTVPhoto = async (
  cctvId: number,
  file: File,
  fileName: string
): Promise<FotoCCTV> => {
  const formData = new FormData();
  formData.append('cctv', cctvId.toString());
  formData.append('file_path', file);
  formData.append('file_name', fileName);

  const response = await fetch(`${API_BASE_URL}/foto-cctv/`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteCCTVPhoto = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/foto-cctv/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};
