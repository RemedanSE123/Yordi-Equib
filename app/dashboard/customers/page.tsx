'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit2, Trash2, Search, ShieldAlert, X, DollarSign, Calendar, Users } from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  fullName: string;
  phone: string;
  ekubType: string;
  todayContribution: number;
  totalContribution: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function CustomersPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      customerId: 'CUST001',
      fullName: 'Abebe Bekele',
      phone: '0912345678',
      ekubType: 'Daily EKUB',
      todayContribution: 100,
      totalContribution: 2500,
      status: 'active',
      joinDate: '2024-01-01',
    },
    {
      id: '2',
      customerId: 'CUST002',
      fullName: 'Fatima Ahmed',
      phone: '0923456789',
      ekubType: 'Weekly EKUB',
      todayContribution: 250,
      totalContribution: 1750,
      status: 'active',
      joinDate: '2024-01-05',
    },
    {
      id: '3',
      customerId: 'CUST003',
      fullName: 'Kebede Desta',
      phone: '0934567890',
      ekubType: 'Monthly EKUB',
      todayContribution: 0,
      totalContribution: 1200,
      status: 'inactive',
      joinDate: '2024-01-10',
    },
    {
      id: '4',
      customerId: 'CUST004',
      fullName: 'Tigist Mengistu',
      phone: '0945678901',
      ekubType: '105 Days EKUB',
      todayContribution: 50,
      totalContribution: 800,
      status: 'active',
      joinDate: '2024-01-15',
    },
    {
      id: '5',
      customerId: 'CUST005',
      fullName: 'Solomon Alemu',
      phone: '0956789012',
      ekubType: 'Share EKUB',
      todayContribution: 60,
      totalContribution: 600,
      status: 'active',
      joinDate: '2024-01-20',
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    fullName: '',
    phone: '',
    ekubType: '',
  });

  const userRole = (session?.user as any)?.role;

  const ekubTypes = ['Daily EKUB', 'Weekly EKUB', 'Monthly EKUB', '105 Days EKUB', 'Share EKUB'];

  if (!['admin', 'manager', 'secretary', 'employee'].includes(userRole)) {
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
    c.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      customerId: formData.customerId,
      fullName: formData.fullName,
      phone: formData.phone,
      ekubType: formData.ekubType,
      todayContribution: 0,
      totalContribution: 0,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    };
    setCustomers([...customers, newCustomer]);
    setFormData({ customerId: '', fullName: '', phone: '', ekubType: '' });
    setShowForm(false);
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(customers.map(c =>
        c.id === editingCustomer.id
          ? {
            ...c,
            customerId: formData.customerId,
            fullName: formData.fullName,
            phone: formData.phone,
            ekubType: formData.ekubType
          }
          : c
      ));
      setEditingCustomer(null);
      setFormData({ customerId: '', fullName: '', phone: '', ekubType: '' });
      setShowForm(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      customerId: customer.customerId,
      fullName: customer.fullName,
      phone: customer.phone,
      ekubType: customer.ekubType,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({ customerId: '', fullName: '', phone: '', ekubType: '' });
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">EKUB Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Today (ETB)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total (ETB)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.customerId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{customer.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-50 text-[#016cc4] rounded-lg text-xs font-medium">
                      {customer.ekubType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    ETB {customer.todayContribution.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ETB {customer.totalContribution.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${customer.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {customer.status === 'active' ? 'Active' : 'Inactive'}
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

            <form onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
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
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  value={formData.ekubType}
                  onChange={(e) => setFormData({ ...formData, ekubType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition bg-white"
                  required
                >
                  <option value="">Select EKUB Type</option>
                  {ekubTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
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