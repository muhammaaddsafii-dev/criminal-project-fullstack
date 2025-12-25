"use client";

import { Bell, Sun, Moon, LogOut, User, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';  // ← TAMBAHKAN INI
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavbarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export function Navbar({ sidebarCollapsed, onMobileMenuToggle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();  // ← TAMBAHKAN INI

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      logout();
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64',
        'max-lg:left-0'
      )}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative hover:bg-accent"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-accent">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                {/* ← GANTI static "Admin" dengan data user */}
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name || user?.username || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* User Info */}
              <div className="px-2 py-1.5 text-sm text-muted-foreground border-b border-border mb-1">
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-xs">{user?.email}</p>
                <p className="text-xs capitalize mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {user?.jabatan}
                  </span>
                </p>
              </div>
              
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              
              {/* ← TAMBAHKAN onClick untuk logout */}
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}