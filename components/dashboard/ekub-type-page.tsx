'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

type PaymentState = 'Paid' | 'Unpaid';

interface EkubCustomerRow {
  customerId: string;
  fullName: string;
  phone: string;
  roundLabel: string;
  round: number; // Round (1-12)
  period: number; // Added period (Day X, Week X, etc.)
  paymentStatus: PaymentState;
  receivedEkub: 'Yes' | 'No';
  winnerRound?: string;
  amount: number;
  totalPaid?: number;
  recordedBy?: string;
  date?: string;
}

interface EkubTypePageProps {
  title: string;
  subtitle: string;
  customers: EkubCustomerRow[];
  ekubType: 'daily' | 'weekly' | 'monthly' | '105-days' | 'share';
}

export default function EkubTypePage({ title, subtitle, customers, ekubType }: EkubTypePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [filterRound, setFilterRound] = useState<number | 'all'>('all');
  const [filterPeriod, setFilterPeriod] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Paid' | 'Unpaid'>('all');
  const [filterReceived, setFilterReceived] = useState<'all' | 'Yes' | 'No'>('all');

  // Ethiopian Months
  const ethiopianMonths = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehasie',
    'Pagume 1', 'Pagume 2'
  ];

  // Get total periods
  const getTotalPeriods = () => {
    switch (ekubType) {
      case 'daily': return 30;
      case 'weekly': return 60;
      case 'monthly': return 14;
      case '105-days': return 107;
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

  const getPaymentForPeriod = (customerId: string, period: number) => {
    const hash = (customerId.charCodeAt(customerId.length - 1) + period) % 3;
    return hash !== 0;
  };

  const filteredRows = useMemo(() => {
    return customers.filter((row) => {
      const matchesSearch =
        row.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.phone.includes(searchTerm);

      const matchesRound = filterRound === 'all' || row.round === filterRound;
      
      // Matrix view ignores period and status filters
      if (viewMode === 'matrix') {
        return matchesSearch && matchesRound;
      }

      const matchesPeriod = filterPeriod === 'all' || row.period === filterPeriod;
      const matchesStatus = filterStatus === 'all' || row.paymentStatus === filterStatus;
      const matchesReceived = filterReceived === 'all' || row.receivedEkub === filterReceived;

      return matchesSearch && matchesRound && matchesPeriod && matchesStatus && matchesReceived;
    });
  }, [customers, searchTerm, filterRound, filterPeriod, filterStatus, filterReceived, viewMode]);

  const totalUsers = customers.length;
  const totalCollected = customers.reduce((sum, row) => sum + row.amount, 0);

  const getPeriodCollection = () => {
    return filteredRows
      .filter((row) => row.paymentStatus === 'Paid')
      .reduce((sum, row) => sum + row.amount, 0);
  };

  const paidCount = filteredRows.filter((row) => row.paymentStatus === 'Paid').length;
  const unpaidCount = filteredRows.length - paidCount;

  const handlePrevPeriod = () => {
    if (currentPeriod > 1) setCurrentPeriod(currentPeriod - 1);
  };

  const handleNextPeriod = () => {
    if (currentPeriod < totalPeriods) setCurrentPeriod(currentPeriod + 1);
  };

  const getPeriodTitle = () => {
    if (viewMode === 'table') {
      return `${getPeriodLabel(1)} to ${getPeriodLabel(totalPeriods)}`;
    }
    return getPeriodLabel(currentPeriod);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header - Reverted to simpler style */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        {/* KPI Cards - Reverted to simpler style */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Members</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Collected</p>
              <p className="mt-1 text-2xl font-bold text-[#016cc4]">ETB {totalCollected.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Filtered Collection</p>
              <p className="mt-1 text-2xl font-bold text-green-600">ETB {getPeriodCollection().toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Paid / Unpaid</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                <span className="text-green-600">{paidCount}</span>
                <span className="text-gray-300 mx-2">/</span>
                <span className="text-red-600">{unpaidCount}</span>
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
        <div className="p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#016cc4] outline-none"
            />
          </div>

          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium focus:border-[#016cc4] outline-none bg-white"
          >
            <option value="all">All Rounds</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(r => (
              <option key={r} value={r}>Round {r}</option>
            ))}
          </select>

          {viewMode === 'table' && (
            <>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium focus:border-[#016cc4] outline-none bg-white"
              >
                <option value="all">All Periods</option>
                {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(p => (
                  <option key={p} value={p}>{getPeriodLabel(p)}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium focus:border-[#016cc4] outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Full Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Round</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.map((row) => (
                    <tr key={row.customerId} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.customerId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.phone}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#016cc4]">R-{row.round}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getPeriodLabel(row.period)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {row.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">ETB {row.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{row.recordedBy || 'Admin'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRows.length === 0 && (
                <div className="text-center py-10 text-gray-500">No records found</div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10 border-r">Member</th>
                    {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(period => (
                      <th key={period} className="px-2 py-3 text-center text-xs font-semibold text-gray-600 min-w-[60px]">
                        {getPeriodLabel(period)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.map((row) => (
                    <tr key={row.customerId} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[120px]">{row.fullName}</span>
                          <span className="text-[10px] text-gray-400">{row.customerId}</span>
                        </div>
                      </td>
                      {Array.from({ length: totalPeriods }, (_, i) => i + 1).map(period => {
                        const isPaid = getPaymentForPeriod(row.customerId, period);
                        return (
                          <td key={period} className="px-2 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-200'}`}>
                              {isPaid ? '✓' : '✗'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRows.length === 0 && (
                <div className="text-center py-10 text-gray-500">No records found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}