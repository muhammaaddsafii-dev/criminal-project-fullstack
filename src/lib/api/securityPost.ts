// lib/api/securityPost.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface Desa {
  id: number;
  nama: string;
  kecamatan: number;
  kecamatan_nama: string;
}

export interface FotoPosKeamanan {
  id: number;
  file_path: string;
  file_name: string;
  created_at: string;
  updated_at: string;
  pos_keamanan: number;
}

export interface PosKeamanan {
  id: number;
  nama: string;
  desa: number;
  desa_nama: string;
  kecamatan_nama: string;
  alamat: string;
  keterangan?: string;
  lokasi?: string;
  foto: FotoPosKeamanan[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreatePosKeamananData {
  nama: string;
  desa: number;
  alamat: string;
  keterangan?: string;
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

// Desa APIs (untuk dropdown)
export const getDesa = async (): Promise<Desa[]> => {
  const response = await fetch(`${API_BASE_URL}/desa/`);
  const data = await handleResponse(response);
  return data.results || data;
};

// Pos Keamanan APIs
export const getPosKeamanan = async (
  params?: {
    page?: number;
    search?: string;
    desa_id?: number;
  }
): Promise<PaginatedResponse<PosKeamanan>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.desa_id) {
    queryParams.append('desa_id', params.desa_id.toString());
  }
  
  const url = `${API_BASE_URL}/pos-keamanan/?${queryParams.toString()}`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const getPosKeamananById = async (id: number): Promise<PosKeamanan> => {
  const response = await fetch(`${API_BASE_URL}/pos-keamanan/${id}/`);
  return handleResponse(response);
};

export const createPosKeamanan = async (
  data: CreatePosKeamananData,
  photos: { file: File; fileName: string }[]
): Promise<PosKeamanan> => {
  // First, create the pos keamanan
  const response = await fetch(`${API_BASE_URL}/pos-keamanan/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const posKeamanan = await handleResponse(response);
  
  // Then upload photos if any
  if (photos.length > 0) {
    await Promise.all(
      photos.map((photo) => uploadPhoto(posKeamanan.id, photo.file, photo.fileName))
    );
  }
  
  // Fetch the updated pos keamanan with photos
  return getPosKeamananById(posKeamanan.id);
};

export const updatePosKeamanan = async (
  id: number,
  data: Partial<CreatePosKeamananData>
): Promise<PosKeamanan> => {
  const response = await fetch(`${API_BASE_URL}/pos-keamanan/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deletePosKeamanan = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/pos-keamanan/${id}/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// Photo APIs
export const uploadPhoto = async (
  posKeamananId: number,
  file: File,
  fileName: string
): Promise<FotoPosKeamanan> => {
  const formData = new FormData();
  formData.append('pos_keamanan', posKeamananId.toString());
  formData.append('file_path', file);
  formData.append('file_name', fileName);
  
  const response = await fetch(`${API_BASE_URL}/foto-pos-keamanan/`, {
    method: 'POST',
    body: formData,
  });
  
  return handleResponse(response);
};

export const deletePhoto = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/foto-pos-keamanan/${id}/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};