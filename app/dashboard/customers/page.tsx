'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit2, Trash2, Search, ShieldAlert, X, DollarSign, Calendar, Users } from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  fullName: string;
  phone: string;
  ekubType: string;
  isActive: boolean;
}

export default function CustomersPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<any[]>([]);
  const [ekubGroups, setEkubGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    customer_code: '',
    full_name: '',
    phone: '',
    ekub_type: 'DAILY',
  });

  const fetchData = async () => {
    try {
      const custRes = await fetch('/api/customers');
      const custList = await custRes.json();
      if (Array.isArray(custList)) setCustomers(custList);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const userRole = (session?.user as any)?.role;

  if (!['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR'].includes(userRole)) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md p-8 rounded-3xl border border-red-100 bg-red-50/50 backdrop-blur">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-950 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage customers. Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  const filteredCustomers = customers.filter(c =>
    (c.customerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setMessage({ text: 'Customer added successfully!', type: 'success' });
        setTimeout(() => {
          fetchData();
          closeForm();
        }, 1500);
      } else {
        const err = await response.json();
        setMessage({ text: err.error || 'Failed to add customer', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to connect to server', type: 'error' });
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setMessage({ text: 'Customer updated successfully!', type: 'success' });
        setTimeout(() => {
          fetchData();
          closeForm();
        }, 1500);
      } else {
        const err = await response.json();
        setMessage({ text: err.error || 'Failed to update customer', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to connect to server', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchData();
        } else {
          const err = await response.json();
          alert(err.error || 'Failed to delete customer');
        }
      } catch (error) {
        alert('Failed to connect to server');
      }
    }
  };

  const openEditForm = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      customer_code: customer.customerId,
      full_name: customer.fullName,
      phone: customer.phone,
      ekub_type: customer.ekubType,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setMessage(null);
    setFormData({ customer_code: '', full_name: '', phone: '', ekub_type: 'DAILY' });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage EKUB customers and members</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#016cc4] text-white px-5 py-2.5 rounded-xl hover:bg-[#0158a3] transition shadow-sm font-medium"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID, name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition bg-white"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">EKUB Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Paid (ETB)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">Loading customers...</td>
                </tr>
              ) : filteredCustomers.map((customer, index) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.customerId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{customer.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-50 text-[#016cc4] rounded-lg text-xs font-medium">
                      {customer.ekubType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ETB {(customer.totalPaid || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${customer.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      {customer.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(customer)}
                        className="p-1.5 text-gray-600 hover:text-[#016cc4] hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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

      {/* Modal Popup for Add/Edit Customer */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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

            <form onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={formData.customer_code}
                  onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition"
                  placeholder="e.g., CUST001"
                  required
                />
              </div>

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
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition"
                  placeholder="e.g., 0912345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EKUB Type
                </label>
                <select
                  value={formData.ekub_type}
                  onChange={(e) => setFormData({ ...formData, ekub_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition bg-white"
                  required
                >
                  <option value="DAILY">Daily EKUB</option>
                  <option value="WEEKLY">Weekly EKUB</option>
                  <option value="MONTHLY">Monthly EKUB</option>
                  <option value="DAY_105">105 Days EKUB</option>
                  <option value="SHARE">Share EKUB</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#016cc4] text-white py-2.5 rounded-lg font-medium hover:bg-[#0158a3] transition"
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
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
    </div>
  );
}