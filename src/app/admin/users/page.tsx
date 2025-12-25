// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, UserCheck, UserX, Clock, Plus, Edit, Trash2, 
  Search, Filter, Shield, Power, Eye, EyeOff 
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  jabatan: string;
  is_active: boolean;
  created_at: string;
}

interface UserFormData {
  username: string;
  email: string;
  name: string;
  jabatan: string;
  password: string;
  password_confirm: string;
  is_active: boolean;
}

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    name: '',
    jabatan: 'viewer',
    password: '',
    password_confirm: '',
    is_active: true,
  });
  const [formError, setFormError] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editingUser && formData.password !== formData.password_confirm) {
      setFormError('Password tidak cocok');
      return;
    }

    try {
      const url = editingUser
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/${editingUser.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/users/`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const body: any = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        jabatan: formData.jabatan,
        is_active: formData.is_active,
      };

      if (!editingUser || formData.password) {
        body.password = formData.password;
        body.password_confirm = formData.password_confirm;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchUsers();
        handleCloseModal();
      } else {
        const error = await response.json();
        setFormError(Object.values(error).flat().join(', '));
      }
    } catch (error) {
      setFormError('Terjadi kesalahan saat menyimpan data');
    }
  };

  // Handle delete
  const handleDelete = async (userId: number) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/toggle_status/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        name: user.name,
        jabatan: user.jabatan,
        password: '',
        password_confirm: '',
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        name: '',
        jabatan: 'viewer',
        password: '',
        password_confirm: '',
        is_active: true,
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormError('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen User</h1>
            <p className="text-muted-foreground">Kelola pengguna sistem</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah User
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
            variant="success"
          />
          <StatsCard
            title="Users Nonaktif"
            value={inactiveUsers}
            icon={UserX}
            variant="destructive"
          />
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari username, nama, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.jabatan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={user.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                            title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Tambah User'}
            </h2>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Jabatan</label>
                <select
                  value={formData.jabatan}
                  onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">Administrator</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
                  <option value="petugas">Petugas Keamanan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {editingUser && '(kosongkan jika tidak ingin mengubah)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!editingUser}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingUser}
                  minLength={8}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  User Aktif
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}