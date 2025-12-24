// lib/api/kecamatan.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface Kecamatan {
  id: number;
  nama: string;
  deskripsi?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateKecamatanData {
  nama: string;
  deskripsi?: string;
}

// Helper function to handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get all Kecamatan with pagination
export const getKecamatan = async (
  params?: {
    page?: number;
    search?: string;
  }
): Promise<PaginatedResponse<Kecamatan>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);
  
  const url = `${API_BASE_URL}/kecamatan/?${queryParams.toString()}`;
  const response = await fetch(url);
  return handleResponse(response);
};

// Get single Kecamatan by ID
export const getKecamatanById = async (id: number): Promise<Kecamatan> => {
  const response = await fetch(`${API_BASE_URL}/kecamatan/${id}/`);
  return handleResponse(response);
};

// Create new Kecamatan
export const createKecamatan = async (
  data: CreateKecamatanData
): Promise<Kecamatan> => {
  const response = await fetch(`${API_BASE_URL}/kecamatan/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
};

// Update Kecamatan
export const updateKecamatan = async (
  id: number,
  data: Partial<CreateKecamatanData>
): Promise<Kecamatan> => {
  const response = await fetch(`${API_BASE_URL}/kecamatan/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Delete Kecamatan
export const deleteKecamatan = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/kecamatan/${id}/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};