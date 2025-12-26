// src/lib/api/download.ts
// API functions untuk download data kriminalitas dalam berbagai format

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface DownloadParams {
  jenis_kejahatan_id?: number;
  nama_kejahatan_id?: number;
  kecamatan_id?: number;
  desa_id?: number;
  status_id?: number;
  is_approval?: boolean;
  search?: string;
  id?: number; // Untuk download single record by ID
}

/**
 * Build query string from parameters
 */
const buildQueryString = (params: DownloadParams): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  
  return query.toString();
};

/**
 * Download file helper function
 */
const downloadFile = async (url: string, filename: string) => {
  try {
    console.log('Downloading from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    // Get blob from response
    const blob = await response.blob();
    console.log('Blob size:', blob.size, 'bytes');
    
    if (blob.size === 0) {
      throw new Error('File kosong - tidak ada data untuk diunduh');
    }
    
    // Create blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
    console.log('Download success!');
    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

/**
 * Download data kriminalitas sebagai Excel
 */
export const downloadExcel = async (params: DownloadParams = {}): Promise<{ success: boolean }> => {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}/laporan-kejahatan/download-excel/${queryString ? '?' + queryString : ''}`;
  const filename = `data_kriminalitas_${new Date().toISOString().slice(0, 10)}.xlsx`;
  
  console.log('downloadExcel called with params:', params);
  return downloadFile(url, filename);
};

/**
 * Download data kriminalitas sebagai GeoJSON
 */
export const downloadGeoJSON = async (params: DownloadParams = {}): Promise<{ success: boolean }> => {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}/laporan-kejahatan/download-geojson/${queryString ? '?' + queryString : ''}`;
  const filename = `data_kriminalitas_${new Date().toISOString().slice(0, 10)}.geojson`;
  
  console.log('downloadGeoJSON called with params:', params);
  return downloadFile(url, filename);
};

/**
 * Download data kriminalitas sebagai Shapefile (ZIP)
 */
export const downloadShapefile = async (params: DownloadParams = {}): Promise<{ success: boolean }> => {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}/laporan-kejahatan/download-shapefile/${queryString ? '?' + queryString : ''}`;
  const filename = `data_kriminalitas_${new Date().toISOString().slice(0, 10)}.zip`;
  
  console.log('downloadShapefile called with params:', params);
  return downloadFile(url, filename);
};

/**
 * Download single record by ID (Excel)
 */
export const downloadExcelById = async (id: number): Promise<{ success: boolean }> => {
  // Filter by specific ID instead of search string
  return downloadExcel({ id });
};

/**
 * Download single record by ID (GeoJSON)
 */
export const downloadGeoJSONById = async (id: number): Promise<{ success: boolean }> => {
  return downloadGeoJSON({ id });
};

/**
 * Download single record by ID (Shapefile)
 */
export const downloadShapefileById = async (id: number): Promise<{ success: boolean }> => {
  return downloadShapefile({ id });
};

/**
 * Get download statistics
 */
export const getDownloadStats = async (): Promise<{
  total_records: number;
  records_with_location: number;
  records_without_location: number;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/laporan-kejahatan/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      total_records: data.count || 0,
      records_with_location: data.count || 0,
      records_without_location: 0,
    };
  } catch (error) {
    console.error('Error fetching download stats:', error);
    throw error;
  }
};