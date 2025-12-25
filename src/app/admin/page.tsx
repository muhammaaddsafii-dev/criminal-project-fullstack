//src/app/admin/page.tsx
'use client';

import { 
  FileWarning, 
  Video, 
  Shield, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { crimeData, cctvData, securityPostData, userData } from '@/lib/dashboard/data';
import { cn } from '@/lib/dashboard/utils';

const quickLinks = [
  { 
    path: '/admin/kriminalitas', 
    label: 'Data Kriminalitas', 
    icon: FileWarning,
    description: 'Kelola data kejadian kriminal',
    color: 'bg-destructive/10 text-destructive'
  },
  { 
    path: '/admin/cctv', 
    label: 'Data CCTV', 
    icon: Video,
    description: 'Pantau status kamera pengawas',
    color: 'bg-info/10 text-info'
  },
  { 
    path: '/admin/pos-keamanan', 
    label: 'Data Pos Keamanan', 
    icon: Shield,
    description: 'Kelola pos dan petugas',
    color: 'bg-success/10 text-success'
  },
  // { 
  //   path: '/admin/users', 
  //   label: 'List Users', 
  //   icon: Users,
  //   description: 'Kelola pengguna sistem',
  //   color: 'bg-warning/10 text-warning'
  // },
  { 
    path: '/admin/kejadian-lainnya', 
    label: 'Kejadian Lainnya', 
    icon: Clock,
    description: 'Kelola kejadian lainnya',
    color: 'bg-warning/10 text-warning'
  },
];

export default function DashboardPage() {
  const totalCrimes = crimeData.length;
  const activeCCTV = cctvData.filter((d) => d.status === 'Aktif').length;
  const activePosts = securityPostData.filter((d) => d.status === 'Aktif').length;
  const activeUsers = userData.filter((d) => d.status === 'Aktif').length;

  const recentCrimes = crimeData.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang di Sistem Monitoring Kriminalitas IMIP</p>
        </div>

        {/* Main Stats */}
        {/* <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Kasus Kriminal"
            value={totalCrimes}
            icon={FileWarning}
            trend={{ value: 12, isPositive: false }}
            variant="destructive"
          />
          <StatsCard
            title="CCTV Aktif"
            value={activeCCTV}
            icon={Video}
            trend={{ value: 5, isPositive: true }}
            variant="success"
          />
          <StatsCard
            title="Pos Keamanan Aktif"
            value={activePosts}
            icon={Shield}
            trend={{ value: 3, isPositive: true }}
            variant="primary"
          />
          <StatsCard
            title="Users Aktif"
            value={activeUsers}
            icon={Users}
            trend={{ value: 15, isPositive: true }}
            variant="warning"
          />
        </div> */}

        {/* Quick Links */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link, index) => (
            <Link
              key={link.path}
              href={link.path}
              className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', link.color)}>
                  <link.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Crimes */}
          <div className="rounded-xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Kejadian Terbaru</h2>
              <Link href="/admin/kriminalitas" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="space-y-3">
              {recentCrimes.map((crime) => (
                <div
                  key={crime.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    crime.tingkatBahaya === 'Kritis' || crime.tingkatBahaya === 'Tinggi'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-warning/10 text-warning'
                  )}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{crime.jenisKejadian}</p>
                    <p className="text-sm text-muted-foreground truncate">{crime.lokasi}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                      crime.status === 'Selesai'
                        ? 'bg-success/10 text-success'
                        : crime.status === 'Proses'
                        ? 'bg-info/10 text-info'
                        : 'bg-warning/10 text-warning'
                    )}>
                      {crime.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{crime.tanggal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Status Sistem</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium text-foreground">Server Utama</span>
                </div>
                <span className="text-sm text-success font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium text-foreground">Database</span>
                </div>
                <span className="text-sm text-success font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium text-foreground">CCTV Network</span>
                </div>
                <span className="text-sm text-success font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <span className="font-medium text-foreground">Backup System</span>
                </div>
                <span className="text-sm text-warning font-medium">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}