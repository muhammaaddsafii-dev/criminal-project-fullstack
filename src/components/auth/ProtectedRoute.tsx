// src/components/auth/ProtectedRoute.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login'];
    
    if (!isLoading && !isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes - allow access
  const publicRoutes = ['/', '/login'];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Protected routes - require authentication
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}