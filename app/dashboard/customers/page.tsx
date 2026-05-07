'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Search, ShieldAlert, X, DollarSign, Calendar, Users, History, CreditCard, Clock, CheckCircle2, User } from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  fullName: string;
  phone: string;
  ekubType: string;
  isActive: boolean;
  totalPaid?: number;
  createdByName?: string;
}

export default function CustomersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [filterEkubType, setFilterEkubType] = useState<string>('all');
  const [filterCreatedBy, setFilterCreatedBy] = useState<string>('all');
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

  const fetchHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/payments?customerId=${customer.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPaymentHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const userRole = (session?.user as any)?.role;
  const isEmployee = userRole === 'EMPLOYEE';
  const isManager = userRole === 'MANAGER';

  if (!['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR', 'EMPLOYEE'].includes(userRole)) {
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

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      (c.customerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm);
    
    const matchesEkubType = filterEkubType === 'all' || c.ekubType === filterEkubType;
    const matchesCreatedBy = filterCreatedBy === 'all' || c.createdByName === filterCreatedBy;

    return matchesSearch && matchesEkubType && matchesCreatedBy;
  });

  const uniqueCreators = Array.from(new Set(customers.map(c => c.createdByName))).filter(Boolean).sort();

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
    const confirmed = window.confirm('Are you sure you want to update?');
    if (!confirmed) return;
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
    const confirmed = window.confirm('Are you sure you want to delete?');
    if (!confirmed) return;
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
  };

  const openEditForm = (customer: Customer) => {
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
        {!isManager && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#016cc4] text-white px-5 py-2.5 rounded-xl hover:bg-[#0158a3] transition shadow-sm font-medium"
          >
            <Plus size={18} />
            Add Customer
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search code, name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition bg-white"
          />
        </div>

        <select
          value={filterEkubType}
          onChange={(e) => setFilterEkubType(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#016cc4] outline-none bg-white text-sm font-medium"
        >
          <option value="all">All EKUB Types</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="DAY_105">105 Days</option>
          <option value="SHARE">Share</option>
        </select>

        <select
          value={filterCreatedBy}
          onChange={(e) => setFilterCreatedBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#016cc4] outline-none bg-white text-sm font-medium"
        >
          <option value="all">Created By: All</option>
          {uniqueCreators.map(name => (
            <option key={name} value={name!}>{name}</option>
          ))}
        </select>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                {!isManager && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pay</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">History</th>
                {!isEmployee && !isManager && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-500">Loading customers...</td>
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
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <User size={14} className="text-gray-400" />
                      {customer.createdByName || 'System'}
                    </div>
                  </td>
                  {!isManager && (
                    <>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${customer.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                          }`}>
                          {customer.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => router.push(`/dashboard/payments?customerId=${customer.customerId}`)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition flex items-center gap-1.5 font-bold text-xs"
                          title="Add Payment"
                        >
                          <CreditCard size={18} />
                          PAY
                        </button>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => fetchHistory(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition flex items-center gap-1.5 font-bold text-xs"
                      title="View History"
                    >
                      <History size={18} />
                       HISTORY
                    </button>
                  </td>
                  {!isEmployee && !isManager && (
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(customer)}
                          className="p-1.5 text-gray-600 hover:text-[#016cc4] hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        {(userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'SECRETARY') && (
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-slate-200/50 border border-slate-100">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-br from-slate-50/50 to-white">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <History className="text-[#016cc4]" size={24} />
                  Payment History
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-semibold text-[#016cc4] bg-blue-50 px-2 py-0.5 rounded-lg">
                    {selectedCustomer.fullName}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    ID: {selectedCustomer.customerId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-[#016cc4] rounded-full animate-spin"></div>
                  <p className="text-sm font-medium tracking-wide">Syncing records...</p>
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                    <Clock size={28} className="text-slate-200" />
                  </div>
                  <p className="text-lg font-semibold text-slate-600">No History Found</p>
                  <p className="text-sm text-slate-400 mt-1">This customer hasn't made any payments yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-100 hover:shadow-sm transition-all duration-200 group"
                    >
                      {/* Left: Amount & Period */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[18px] font-extrabold text-slate-900">
                            ETB {payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 mt-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-white bg-[#016cc4] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                              {payment.round_number}
                            </span>
                            <span className="text-[12px] font-bold text-slate-700">
                              {payment.payment_period}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Success Status */}
                      <div className="flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border-2 border-emerald-100 shadow-sm shadow-emerald-50">
                          <CheckCircle2 size={16} />
                          <span className="text-[12px] font-black uppercase tracking-widest">Success</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">Verified Payment</span>
                      </div>

                      {/* Right: Metadata */}
                      <div className="flex-1 flex flex-col items-end">
                        <div className="flex items-center gap-2 text-slate-700">
                          <User size={14} className="text-[#016cc4]" />
                          <span className="text-[13px] font-bold text-slate-900">
                            {payment.created_by_name || 'System'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end mt-1">
                          <span className="text-[10px] font-black text-[#016cc4] uppercase tracking-tighter">
                            Payment added by
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                            {new Date(payment.payment_date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-50">
              <button
                onClick={() => setShowHistory(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold text-sm hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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