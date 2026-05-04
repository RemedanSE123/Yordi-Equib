'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

interface EkubForm {
  id?: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | '105days' | 'share';
  contributionAmount: number;
  frequencyDays: number;
  totalRounds: number;
}

export default function EkubsPage() {
  const { data: session } = useSession();
  const [ekubs, setEkubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    type: 'DAILY',
    contribution_amount: 0,
    total_rounds: 12,
  });

  const fetchEkubs = async () => {
    try {
      const response = await fetch('/api/ekub-groups');
      const data = await response.json();
      if (Array.isArray(data)) {
        setEkubs(data);
      }
    } catch (error) {
      console.error('Failed to fetch ekubs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEkubs();
  }, []);

  const userRole = (session?.user as any)?.role;

  if (!['ADMIN', 'MANAGER'].includes(userRole)) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md p-8 rounded-3xl border border-red-100 bg-red-50/50 backdrop-blur">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-950 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators and managers can manage EKUB groups. Please contact your manager if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/ekub-groups/${editingId}` : '/api/ekub-groups';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchEkubs();
        handleCancel();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save EKUB group');
      }
    } catch (error) {
      alert('Failed to connect to server');
    }
  };

  const handleEdit = (ekub: any) => {
    setFormData({
      name: ekub.name,
      type: ekub.type,
      contribution_amount: ekub.contribution_amount,
      total_rounds: ekub.total_rounds,
    });
    setEditingId(ekub.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this EKUB group?')) {
      alert('Deletion is currently restricted.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', type: 'DAILY', contribution_amount: 0, total_rounds: 12 });
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">EKUB Management</h1>
          <p className="text-gray-600 mt-2">Create and manage EKUB groups</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl hover:bg-opacity-90 transition shadow-lg shadow-primary/20 font-bold"
          >
            <Plus size={20} />
            New EKUB
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950 mb-4">
            {editingId ? 'Edit EKUB' : 'Create New EKUB'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EKUB Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="DAY_105">105 Days</option>
                <option value="SHARE">Share</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contribution Amount
              </label>
              <input
                type="number"
                value={formData.contribution_amount}
                onChange={(e) => setFormData({ ...formData, contribution_amount: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Rounds
              </label>
              <input
                type="number"
                value={formData.total_rounds}
                onChange={(e) => setFormData({ ...formData, total_rounds: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                required
              />
            </div>
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="flex-1 bg-[#016cc4] text-white py-3 px-4 rounded-xl font-bold hover:bg-opacity-90 transition shadow-md shadow-primary/10"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EKUB List */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Rounds</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Loading EKUB groups...</td>
                </tr>
              ) : ekubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No EKUB groups found</td>
                </tr>
              ) : ekubs.map((ekub) => (
                <tr key={ekub.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-950">{ekub.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{ekub.type.toLowerCase()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">ETB {(ekub.contribution_amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{ekub.total_rounds}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      ekub.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {ekub.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => handleEdit(ekub)}
                      className="p-2 text-primary hover:bg-primary/5 rounded-xl transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ekub.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
