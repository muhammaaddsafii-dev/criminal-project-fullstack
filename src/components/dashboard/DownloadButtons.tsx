// src/components/dashboard/DownloadButtons.tsx
'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Map, FolderArchive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { downloadExcel, downloadGeoJSON, downloadShapefile } from '@/lib/api/download';
import { useToast } from '@/hooks/use-toast';

interface DownloadButtonsProps {
  filters?: {
    jenis_kejahatan_id?: number;
    nama_kejahatan_id?: number;
    kecamatan_id?: number;
    desa_id?: number;
    status_id?: number;
    is_approval?: boolean;
    search?: string;
  };
}

export function DownloadButtons({ filters = {} }: DownloadButtonsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (format: 'excel' | 'geojson' | 'shapefile') => {
    try {
      setDownloading(format);

      let result;
      switch (format) {
        case 'excel':
          result = await downloadExcel(filters);
          break;
        case 'geojson':
          result = await downloadGeoJSON(filters);
          break;
        case 'shapefile':
          result = await downloadShapefile(filters);
          break;
      }

      if (result.success) {
        toast({
          title: '✓ Download Berhasil',
          description: `File ${format.toUpperCase()} berhasil diunduh`,
        });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: '✗ Download Gagal',
        description: error.message || 'Terjadi kesalahan saat mengunduh file',
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Pilih Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleDownload('excel')}
          disabled={downloading !== null}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleDownload('geojson')}
          disabled={downloading !== null}
          className="cursor-pointer"
        >
          <Map className="mr-2 h-4 w-4" />
          <span>GeoJSON (.geojson)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleDownload('shapefile')}
          disabled={downloading !== null}
          className="cursor-pointer"
        >
          <FolderArchive className="mr-2 h-4 w-4" />
          <span>Shapefile (.zip)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}