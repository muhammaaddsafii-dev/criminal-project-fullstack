"use client";

import { Users, UserCheck, UserX, Clock, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { userData, type UserData } from '@/lib/dashboard/data';

const columns = [
  { key: 'id' as keyof UserData, label: 'ID' },
  { key: 'nama' as keyof UserData, label: 'Nama' },
  { key: 'email' as keyof UserData, label: 'Email' },
  {
    key: 'role' as keyof UserData,
    label: 'Role',
    render: (item: UserData) => <StatusBadge status={item.role} />,
  },
  {
    key: 'status' as keyof UserData,
    label: 'Status',
    render: (item: UserData) => <StatusBadge status={item.status} />,
  },
  { key: 'tanggalBergabung' as keyof UserData, label: 'Tanggal Bergabung' },
  { key: 'actions' as const, label: 'Aksi' },
];

export default function UserList() {
  const totalUsers = userData.length;
  const activeUsers = userData.filter((d) => d.status === 'Aktif').length;
  const inactiveUsers = userData.filter((d) => d.status === 'Nonaktif').length;
  const pendingUsers = userData.filter((d) => d.status === 'Pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">List Users</h1>
          <p className="text-muted-foreground">Kelola pengguna dan hak akses sistem</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Users Aktif"
            value={activeUsers}
            icon={UserCheck}
            trend={{ value: 15, isPositive: true }}
            variant="success"
          />
          <StatsCard
            title="Users Nonaktif"
            value={inactiveUsers}
            icon={UserX}
            variant="destructive"
          />
          <StatsCard
            title="Menunggu Verifikasi"
            value={pendingUsers}
            icon={Clock}
            variant="warning"
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={userData}
          columns={columns}
          searchKeys={['nama', 'email']}
          filterKey="status"
          filterOptions={['Aktif', 'Nonaktif', 'Pending']}
        />
      </div>
    </DashboardLayout>
  );
}
