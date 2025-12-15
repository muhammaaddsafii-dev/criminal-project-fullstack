// src/components/dashboard/Breadcrumb.tsx
'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pathNames: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/kriminalitas': 'Data Kriminalitas',
  '/admin/cctv': 'Data CCTV',
  '/admin/pos-keamanan': 'Data Pos Keamanan',
  '/admin/users': 'List Users',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const pageName = pathNames[pathname] || 'Halaman';

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {pathname !== '/dashboard' && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{pageName}</span>
        </>
      )}
    </nav>
  );
}