// lib/api/desa.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface Desa {
  id: number;
  nama: string;
  deskripsi?: string;
  kecamatan: number;
  kecamatan_nama: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateDesaData {
  nama: string;
  deskripsi?: string;
  kecamatan: number;
}

// Helper function to handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get all Desa with pagination
export const getDesa = async (
  params?: {
    page?: number;
    search?: string;
    kecamatan_id?: number;
  }
): Promise<PaginatedResponse<Desa>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.kecamatan_id) queryParams.append('kecamatan_id', params.kecamatan_id.toString());
  
  const url = `${API_BASE_URL}/desa/?${queryParams.toString()}`;
  const response = await fetch(url);
  return handleResponse(response);
};

// Get single Desa by ID
export const getDesaById = async (id: number): Promise<Desa> => {
  const response = await fetch(`${API_BASE_URL}/desa/${id}/`);
  return handleResponse(response);
};

// Create new Desa
export const createDesa = async (
  data: CreateDesaData
): Promise<Desa> => {
  const response = await fetch(`${API_BASE_URL}/desa/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
};

// Update Desa
export const updateDesa = async (
  id: number,
  data: Partial<CreateDesaData>
): Promise<Desa> => {
  const response = await fetch(`${API_BASE_URL}/desa/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Delete Desa
export const deleteDesa = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/desa/${id}/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};