// src/components/dashboard/DownloadActionButtons.tsx
'use client';

import { useState } from 'react';
import { FileSpreadsheet, Map, FolderArchive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { downloadExcel, downloadGeoJSON, downloadShapefile } from '@/lib/api/download';

interface DownloadActionButtonsProps {
  recordId: number;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
}

export function DownloadActionButtons({
  recordId,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}: DownloadActionButtonsProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (format: 'excel' | 'geojson' | 'shapefile') => {
    try {
      setDownloading(format);
      onDownloadStart?.();

      // Filter by specific record ID
      const filters = { search: `KRM${recordId.toString().padStart(3, '0')}` };

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
        onDownloadComplete?.();
      }
    } catch (error: any) {
      console.error('Download error:', error);
      onDownloadError?.(error.message || 'Gagal mengunduh file');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
              onClick={() => handleDownload('excel')}
              disabled={downloading !== null}
              title="Download Excel"
            >
              {downloading === 'excel' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download Excel</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => handleDownload('geojson')}
              disabled={downloading !== null}
              title="Download GeoJSON"
            >
              {downloading === 'geojson' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Map className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download GeoJSON</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
              onClick={() => handleDownload('shapefile')}
              disabled={downloading !== null}
              title="Download Shapefile"
            >
              {downloading === 'shapefile' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FolderArchive className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download Shapefile (ZIP)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}