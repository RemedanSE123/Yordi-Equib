'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ChevronLeft, ChevronRight, Calendar, Edit2, Trash2, Filter, User, AlertCircle, Database, CheckCircle2, X, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

type PaymentState = 'Paid' | 'Unpaid';

interface Payment {
  id: string;
  customer_id: string;
  customer_code?: string; // Reference ID
  customer_name: string;
  phone: string;
  ekub_type: string;
  amount: number;
  round_number: string;
  payment_period: string;
  payment_status: string;
  recorded_by_name?: string;
  payment_date: string;
}

interface Customer {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string;
  ekub_type: string;
}

interface EkubTypePageProps {
  title: string;
  subtitle: string;
  ekubType: 'daily' | 'weekly' | 'monthly' | '105-days' | 'share';
}

export default function EkubTypePage({ title, subtitle, ekubType }: EkubTypePageProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isEmployee = userRole === 'EMPLOYEE';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [filterRound, setFilterRound] = useState<string | 'all'>('all');
  const [filterPeriod, setFilterPeriod] = useState<string | 'all'>('all');
  const [filterRecordedBy, setFilterRecordedBy] = useState<string | 'all'>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editRound, setEditRound] = useState('');
  const [editPeriod, setEditPeriod] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/by-type?type=${ekubType}`);
      const data = await response.json();
      if (data.payments) {
        setPayments(data.payments);
        setAllCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ekubType]);

  // Ethiopian Months
  const ethiopianMonths = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehasie'
  ];

  // Get total periods
  const getTotalPeriods = () => {
    switch (ekubType) {
      case 'daily': return 30;
      case 'weekly': return 60;
      case 'monthly': return 12; // 12 Ethiopian months
      case '105-days': return 105;
      case 'share': return 60;
      default: return 30;
    }
  };

  // Get period label
  const getPeriodLabel = (period: number) => {
    switch (ekubType) {
      case 'daily': return `Day ${period}`;
      case 'weekly': return `Week ${period}`;
      case 'monthly': return ethiopianMonths[period - 1] || `Month ${period}`;
      case '105-days': return `Day ${period}`;
      case 'share': return `Day ${period}`;
      default: return `Period ${period}`;
    }
  };

  const totalPeriods = getTotalPeriods();

  const getPaymentForPeriod = (customerId: string, periodIndex: number) => {
    const periodLabel = getPeriodLabel(periodIndex);
    const roundLabel = filterRound === 'all' ? 'Round 1' : `Round ${filterRound}`;
    
    return payments.some(p => 
      p.customer_id === customerId && 
      p.round_number === roundLabel && 
      p.payment_period === periodLabel &&
      p.payment_status === 'PAID'
    );
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Search matches code or name or phone
      const matchesSearch =
        p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.customer_code && p.customer_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.phone.includes(searchTerm);

      const matchesRound = filterRound === 'all' || p.round_number === `Round ${filterRound}`;
      const matchesPeriod = filterPeriod === 'all' || p.payment_period === getPeriodLabel(Number(filterPeriod));
      const matchesRecordedBy = filterRecordedBy === 'all' || p.recorded_by_name === filterRecordedBy;
      
      let matchesDate = true;
      if (filterDate) {
        const pDate = new Date(p.payment_date).toISOString().split('T')[0];
        matchesDate = pDate === filterDate;
      }

      return matchesSearch && matchesRound && matchesPeriod && matchesRecordedBy && matchesDate;
    });
  }, [payments, searchTerm, filterRound, filterPeriod, filterRecordedBy, filterDate]);

  const uniqueRecorders = useMemo(() => {
    const recorders = new Set<string>();
    payments.forEach(p => {
      if (p.recorded_by_name) recorders.add(p.recorded_by_name);
    });
    return Array.from(recorders).sort();
  }, [payments]);

  const sortedCustomers = useMemo(() => {
    return [...allCustomers].sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [allCustomers]);

  const totalUsers = allCustomers.length;
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const getFilteredCollection = () => {
    return filteredPayments
      .filter((p) => p.payment_status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    
    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Payment deleted');
        fetchData(); // Refresh
      } else {
        toast.error('Failed to delete payment');
      }
    } catch (error) {
      toast.error('Connection error');
    }
  };

  const handleEditClick = (payment: Payment) => {
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
    setEditRound(payment.round_number.replace('Round ', ''));
    setEditPeriod(payment.payment_period);
    setIsEditModalOpen(true);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    try {
      const res = await fetch(`/api/payments/${editingPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(editAmount),
          round_number: `Round ${editRound}`,
          payment_period: editPeriod,
        }),
      });

      if (res.ok) {
        toast.success('Payment updated successfully');
        setIsEditModalOpen(false);
        fetchData();
      } else {
        toast.error('Failed to update payment');
      }
    } catch (error) {
      toast.error('Connection error');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRound('all');
    setFilterPeriod('all');
    setFilterRecordedBy('all');
    setFilterDate('');
    toast.info('Filters cleared');
  };

  const isFilterActive = searchTerm !== '' || filterRound !== 'all' || filterPeriod !== 'all' || filterRecordedBy !== 'all' || filterDate !== '';

  const handlePrevPeriod = () => {
    if (currentPeriod > 1) setCurrentPeriod(currentPeriod - 1);
  };

  const handleNextPeriod = () => {
    if (currentPeriod < totalPeriods) setCurrentPeriod(currentPeriod + 1);
  };

  const getPeriodTitle = () => {
    if (viewMode === 'table') {
      return `Detailed Transaction History`;
    }
    return `${getPeriodLabel(currentPeriod)} Overview`;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header - Reverted to simpler style */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        {/* KPI Cards */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Members</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Grand Collection</p>
              <p className="mt-1 text-2xl font-bold text-[#016cc4]">ETB {totalCollected.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Filtered Collection</p>
              <p className="mt-1 text-2xl font-bold text-green-600">ETB {getFilteredCollection().toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Payments Count</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {filteredPayments.length} <span className="text-sm font-normal text-gray-400">records</span>
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'table' ? 'bg-[#016cc4] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'matrix' ? 'bg-[#016cc4] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Matrix View
            </button>
          </div>

          <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
            {viewMode === 'matrix' && (
              <button
                onClick={handlePrevPeriod}
                disabled={currentPeriod === 1}
                className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 transition"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1">
              <Calendar size={16} className="text-[#016cc4]" />
              <span className="text-sm font-semibold text-gray-700">{getPeriodTitle()}</span>
            </div>
            {viewMode === 'matrix' && (
              <button
                onClick={handleNextPeriod}
                disabled={currentPeriod === totalPeriods}
                className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 transition"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code/name..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#016cc4] outline-none"
            />
          </div>

          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium focus:border-[#016cc4] outline-none bg-white"
          >
            <option value="all">All Rounds</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(r => (
              <option key={r} value={r.toString()}>Round {r}</option>
            ))}
          </select>

          {viewMode === 'table' && (
            <>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium focus:border-[#016cc4] outline-none bg-white"
              >
                <option value="all">All Periods</option>
                {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(p => (
                  <option key={p} value={p.toString()}>{getPeriodLabel(p)}</option>
                ))}
              </select>

              <select
                value={filterRecordedBy}
                onChange={(e) => setFilterRecordedBy(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium focus:border-[#016cc4] outline-none bg-white"
              >
                <option value="all">Recorded By: All</option>
                {uniqueRecorders.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <div className="relative">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium focus:border-[#016cc4] outline-none bg-white"
                />
                {filterDate && (
                  <button 
                    onClick={() => setFilterDate('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </>
          )}

          {isFilterActive && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-all border border-red-100"
            >
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#016cc4] mx-auto"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading data...</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-12">No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Full Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Round</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">By</th>
                    {!isEmployee && <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((payment, index) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-400 font-medium">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#016cc4]">{payment.customer_code || payment.customer_id.substring(0, 8)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{payment.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{payment.phone}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#016cc4]">{payment.round_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{payment.payment_period}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.payment_status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">ETB {payment.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User size={12} className="text-gray-400" />
                          {payment.recorded_by_name || 'Admin'}
                        </div>
                      </td>
                      {!isEmployee && (
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                              onClick={() => handleEditClick(payment)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete"
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && (
                <div className="text-center py-10 text-gray-500">No records found</div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10 border-r w-12">No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 sticky left-12 bg-gray-50 z-10 border-r min-w-[150px]">Member</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 border-r min-w-[80px]">Round</th>
                    {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(period => (
                      <th key={period} className="px-2 py-3 text-center text-xs font-semibold text-gray-600 min-w-[70px]">
                        {getPeriodLabel(period)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedCustomers.filter(c => 
                    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.customer_code.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((customer, index) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-400 font-medium sticky left-0 bg-white z-10 border-r">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-12 bg-white z-10 border-r shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        <div className="flex flex-col">
                          <span className="truncate font-bold">{customer.full_name}</span>
                          <span className="text-[10px] text-gray-400">{customer.customer_code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-bold text-[#016cc4] border-r">
                        {filterRound === 'all' ? 'R-1' : `R-${filterRound}`}
                      </td>
                      {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(period => {
                        const isPaid = getPaymentForPeriod(customer.id, period);
                        return (
                          <td key={period} className="px-2 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold shadow-sm transition ${isPaid ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-red-50 text-red-200 border border-red-100/50'}`}>
                              {isPaid ? '✓' : '✗'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedCustomers.length === 0 && (
                <div className="text-center py-10 text-gray-500">No members registered for this EKUB type</div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Edit Payment Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-[#016cc4] rounded-xl flex items-center justify-center">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Edit Payment</h2>
                  <p className="text-xs text-slate-500 font-medium">Modify transaction details</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 ml-1">Amount (ETB)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-700 ml-1">Round</label>
                  <select
                    value={editRound}
                    onChange={(e) => setEditRound(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(r => (
                      <option key={r} value={r.toString()}>Round {r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-700 ml-1">Period</label>
                  <select
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(p => (
                      <option key={p} value={getPeriodLabel(p)}>{getPeriodLabel(p)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#016cc4] hover:bg-[#015bb4] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}