// src/components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileWarning, 
  Video, 
  Shield, 
  Users, 
  LayoutDashboard,
  Menu,
  ClipboardPlus,
  Landmark,
  House
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/kriminalitas', label: 'Data Kriminalitas', icon: FileWarning },
  { path: '/admin/cctv', label: 'Data CCTV', icon: Video },
  { path: '/admin/pos-keamanan', label: 'Data Pos Keamanan', icon: Shield },
  { path: '/admin/kejadian-lainnya', label: 'Kejadian Lainnya', icon: ClipboardPlus },
  { path: '/admin/kecamatan', label: 'Kecamatan', icon: Landmark },
  { path: '/admin/desa', label: 'Desa', icon: House },
  // { path: '/admin/users', label: 'List Users', icon: Users },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-3">
        <button
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors duration-200"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2 ml-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Dashboard</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}