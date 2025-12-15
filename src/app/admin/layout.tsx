// src/app/admin/layout.tsx
"use client";

import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/dashboard/ui/tooltip';
import { Toaster } from '@/components/dashboard/ui/toaster';
import { Toaster as Sonner } from '@/components/dashboard/ui/sonner';
import './globals.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        {children}
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </ThemeProvider>
  );
}