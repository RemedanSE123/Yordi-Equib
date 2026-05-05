'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit2, Trash2, Search, ShieldAlert, X, Users as UsersIcon, Copy, Key, Phone, Check, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

// ── Password rule helpers ──────────────────────────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',  label: 'At least 8 characters',               test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: 'Uppercase letter (A-Z)',               test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'Lowercase letter (a-z)',               test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',  label: 'Number (0-9)',                         test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Special character (@, #, $, !…)',      test: (p: string) => /[@#$!%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function isPasswordValid(p: string) {
  return PASSWORD_RULES.every(r => r.test(p));
}

function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  return (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Requirements</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {PASSWORD_RULES.map(rule => {
          const ok = rule.test(password);
          return (
            <div key={rule.id} className={`flex items-center gap-1.5 text-xs transition-all duration-300 ${ok ? 'text-green-600' : 'text-red-500'}`}>
              {ok
                ? <CheckCircle2 size={12} className="flex-shrink-0" />
                : <XCircle size={12} className="flex-shrink-0" />}
              <span className={ok ? 'line-through text-green-500/70' : ''}>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  const pct = (passed / PASSWORD_RULES.length) * 100;
  const color = pct <= 20 ? 'bg-red-500' : pct <= 40 ? 'bg-orange-500' : pct <= 60 ? 'bg-yellow-500' : pct <= 80 ? 'bg-blue-500' : 'bg-green-500';
  const label = pct <= 20 ? 'Very weak' : pct <= 40 ? 'Weak' : pct <= 60 ? 'Fair' : pct <= 80 ? 'Good' : 'Strong';
  const textColor = pct <= 20 ? 'text-red-500' : pct <= 40 ? 'text-orange-500' : pct <= 60 ? 'text-yellow-500' : pct <= 80 ? 'text-blue-500' : 'text-green-500';
  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-gray-400">Strength</span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface User {
  id: string;
  full_name: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'SECRETARY' | 'EMPLOYEE' | 'CUSTOMER';
  createdAt: string;
  is_active: boolean;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'ADMIN' | 'MANAGER' | 'SECRETARY' | 'EMPLOYEE'>('all');
  const [showForm, setShowForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    role: 'EMPLOYEE' as const,
    password: 'P@55w0rd',
    is_active: true,
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const userRole = (session?.user as any)?.role;

  if (userRole !== 'ADMIN') {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md p-8 rounded-3xl border border-red-100 bg-red-50/50 backdrop-blur">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-950 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators can manage system users. Please contact your manager if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').includes(searchTerm);
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast({ title: '⚠️ Invalid Phone', description: 'Phone number must be exactly 10 digits.', variant: 'destructive' });
      return;
    }
    if (!isPasswordValid(formData.password)) {
      toast({ title: '⚠️ Weak Password', description: 'Password does not meet all requirements.', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast({ title: '✅ User Created', description: 'New user has been created successfully.' });
        setTimeout(() => { fetchUsers(); closeForm(); }, 1200);
      } else {
        const err = await response.json();
        toast({ title: '❌ Error', description: err.error || 'Failed to create user.', variant: 'destructive' });
      }
    } catch {
      toast({ title: '⚠️ Connection Error', description: 'Could not reach server.', variant: 'destructive' });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (formData.phone.length !== 10) {
      toast({ title: '⚠️ Invalid Phone', description: 'Phone number must be exactly 10 digits.', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast({ title: '✅ User Updated', description: 'User details have been updated.' });
        setTimeout(() => { fetchUsers(); closeForm(); }, 1200);
      } else {
        const err = await response.json();
        toast({ title: '❌ Error', description: err.error || 'Failed to update user.', variant: 'destructive' });
      }
    } catch {
      toast({ title: '⚠️ Connection Error', description: 'Could not reach server.', variant: 'destructive' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    if (!isPasswordValid(newPassword)) {
      toast({ title: '⚠️ Weak Password', description: 'Password does not meet all requirements.', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (response.ok) {
        toast({ title: '✅ Password Changed', description: `Password for ${selectedUser.full_name} updated successfully.` });
        setTimeout(() => { setShowPasswordModal(false); setNewPassword(''); }, 1200);
      } else {
        const err = await response.json();
        toast({ title: '❌ Error', description: err.error || 'Failed to update password.', variant: 'destructive' });
      }
    } catch {
      toast({ title: '⚠️ Connection Error', description: 'Could not reach server.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchUsers();
          toast({ title: '🗑️ User Deleted', description: 'The user has been removed.' });
        } else {
          const err = await response.json();
          toast({ title: '❌ Error', description: err.error || 'Failed to delete user.', variant: 'destructive' });
        }
      } catch {
        toast({ title: '⚠️ Connection Error', description: 'Could not reach server.', variant: 'destructive' });
      }
    }
  };

  const openEditForm = (user: any) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      password: '', // Don't show password
      is_active: user.is_active,
    });
    setShowForm(true);
  };

  const toggleUserStatus = async (user: any) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to toggle status');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setShowPasswordText(false);
    setMessage(null);
    setFormData({ full_name: '', phone: '', role: 'EMPLOYEE', password: 'P@55w0rd', is_active: true });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied', description: 'Copied to clipboard.' });
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      MANAGER: 'bg-blue-100 text-blue-700',
      SECRETARY: 'bg-green-100 text-green-700',
      EMPLOYEE: 'bg-purple-100 text-purple-700',
      CUSTOMER: 'bg-gray-100 text-gray-600',
    };
    return colors[role.toUpperCase()] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <Toaster />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system users and access levels</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#016cc4] text-white px-5 py-2.5 rounded-xl hover:bg-[#0158a3] transition shadow-sm font-medium"
        >
          <Plus size={18} />
          New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition bg-white"
              />
            </div>
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full md:w-auto px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition bg-white"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="SECRETARY">Secretary</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">Loading users...</td>
                </tr>
              ) : filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.full_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {user.phone}
                      <button
                        onClick={() => copyToClipboard(user.phone)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#016cc4] transition"
                        title="Copy Phone"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium uppercase ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.created_by_name || 'System'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`inline-block px-2 py-1 rounded-lg text-xs font-medium transition ${user.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      title="Click to toggle status"
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(user)}
                        className="p-1.5 text-gray-600 hover:text-[#016cc4] hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPasswordModal(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Change Password"
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup for Add/Edit User */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={closeForm}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {message && (
              <div className="px-6 pt-4">
                <div className={`p-3 rounded-xl text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                  {message.text}
                </div>
              </div>
            )}

            <form onSubmit={editingUser ? handleEditUser : handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition"
                  placeholder="Enter full name"
                  required
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition"
                    placeholder="e.g., 0912345678"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Must be exactly 10 digits</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition bg-white"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SECRETARY">Secretary</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition"
                      placeholder="Default: P@55w0rd"
                    />
                    <button type="button" onClick={() => setShowPasswordText(!showPasswordText)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPasswordText ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <StrengthBar password={formData.password} />
                  <PasswordRules password={formData.password} />
                </div>
              )}

              {editingUser && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">User Status</p>
                    <p className="text-xs text-gray-500">Enable or disable this user account</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#016cc4] text-white py-2.5 rounded-lg font-medium hover:bg-[#0158a3] transition"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {message && (
              <div className="px-6 pt-4">
                <div className={`p-3 rounded-xl text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                  {message.text}
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Changing password for <span className="font-bold text-gray-900">{selectedUser?.full_name}</span>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition"
                    placeholder="Enter new password"
                    required
                  />
                  <button type="button" onClick={() => setShowPasswordText(!showPasswordText)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPasswordText ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <StrengthBar password={newPassword} />
                <PasswordRules password={newPassword} />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!isPasswordValid(newPassword)}
                  className="flex-1 bg-[#016cc4] text-white py-2.5 rounded-lg font-medium hover:bg-[#0158a3] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}