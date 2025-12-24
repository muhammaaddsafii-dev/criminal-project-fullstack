// lib/api/kejadian-lainnya.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface FotoKejadianLainnya {
  id: number;
  file_path: string;
  file_name: string;
  created_at: string;
  updated_at: string;
  kejadian_lainnya: number;
}

export interface KejadianLainnya {
  id: number;
  nama_pelapor: string;
  nama_kejadian: string;
  deskripsi_kejadian: string;
  tanggal_kejadian: string;
  waktu_kejadian: string;
  kecamatan: number;
  desa: number;
  kecamatan_nama: string;
  desa_nama: string;
  status: number;
  status_nama: string;
  lokasi?: string;
  is_approval: boolean;
  foto: FotoKejadianLainnya[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateKejadianLainnyaData {
  nama_pelapor: string;
  nama_kejadian: string;
  deskripsi_kejadian: string;
  tanggal_kejadian: string;
  waktu_kejadian: string;
  kecamatan: number;
  desa: number;
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

// Get all Kejadian Lainnya with pagination
export const getKejadianLainnya = async (
  params?: {
    page?: number;
    search?: string;
    status_id?: number;
    kecamatan_id?: number;
    desa_id?: number;
    is_approval?: boolean;
  }
): Promise<PaginatedResponse<KejadianLainnya>> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status_id) queryParams.append('status_id', params.status_id.toString());
  if (params?.kecamatan_id) queryParams.append('kecamatan_id', params.kecamatan_id.toString());
  if (params?.desa_id) queryParams.append('desa_id', params.desa_id.toString());
  if (params?.is_approval !== undefined) queryParams.append('is_approval', params.is_approval.toString());
  
  const url = `${API_BASE_URL}/kejadian-lainnya/?${queryParams.toString()}`;
  const response = await fetch(url);
  return handleResponse(response);
};

// Get single Kejadian Lainnya by ID
export const getKejadianLainnyaById = async (id: number): Promise<KejadianLainnya> => {
  const response = await fetch(`${API_BASE_URL}/kejadian-lainnya/${id}/`);
  return handleResponse(response);
};

// Create new Kejadian Lainnya
export const createKejadianLainnya = async (
  data: CreateKejadianLainnyaData,
  photos: { file: File; fileName: string }[]
): Promise<KejadianLainnya> => {
  // First, create the kejadian
  const response = await fetch(`${API_BASE_URL}/kejadian-lainnya/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const kejadian = await handleResponse(response);
  
  // Then upload photos if any
  if (photos.length > 0) {
    await Promise.all(
      photos.map((photo) => uploadPhoto(kejadian.id, photo.file, photo.fileName))
    );
  }
  
  // Fetch the updated kejadian with photos
  return getKejadianLainnyaById(kejadian.id);
};

// Update Kejadian Lainnya
export const updateKejadianLainnya = async (
  id: number,
  data: Partial<CreateKejadianLainnyaData>
): Promise<KejadianLainnya> => {
  const response = await fetch(`${API_BASE_URL}/kejadian-lainnya/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Delete Kejadian Lainnya
export const deleteKejadianLainnya = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/kejadian-lainnya/${id}/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// Approve Kejadian Lainnya
export const approveKejadianLainnya = async (id: number): Promise<KejadianLainnya> => {
  const response = await fetch(`${API_BASE_URL}/kejadian-lainnya/${id}/approve/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Toggle approval status
export const toggleApprovalKejadianLainnya = async (id: number, isApproval: boolean): Promise<KejadianLainnya> => {
  if (isApproval) {
    return approveKejadianLainnya(id);
  }
  
  const response = await fetch(`${API_BASE_URL}/kejadian-lainnya/${id}/`, {
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
  kejadianId: number,
  file: File,
  fileName: string
): Promise<FotoKejadianLainnya> => {
  const formData = new FormData();
  formData.append('kejadian_lainnya', kejadianId.toString());
  formData.append('file_path', file);
  formData.append('file_name', fileName);
  
  const response = await fetch(`${API_BASE_URL}/foto-kejadian-lainnya/`, {
    method: 'POST',
    body: formData,
  });
  
  return handleResponse(response);
};

export const deletePhoto = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/foto-kejadian-lainnya/${id}/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};