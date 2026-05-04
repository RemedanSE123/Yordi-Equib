'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FileSpreadsheet, FileText, Calendar, Filter,
  TrendingUp, DollarSign, Users, PieChart,
  Download, RefreshCw, ShieldCheck, Zap,
  BarChart3, Search, Activity, Target, Layers,
  ChevronRight, ArrowUpRight, ArrowDownRight, UserCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
  PieChart as RePieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [activeCategory, setActiveCategory] = useState('financial');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const fetchReport = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        category: activeCategory
      }).toString();
      const response = await fetch(`/api/reports?${query}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      toast.error('Forensic data retrieval failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchReport();
  }, [activeCategory, session]);

  const exportAdvancedExcel = () => {
    if (!reportData?.payments) return;

    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ['YORDI EQUIB SYSTEM - EXECUTIVE SUMMARY'],
      ['Period', `${dateRange.start} to ${dateRange.end}`],
      ['Generated At', new Date().toLocaleString()],
      [''],
      ['KPI Metrics'],
      ['Total Collection Volume', reportData.summary.totalVolume],
      ['Transaction Count', reportData.summary.txCount],
      ['Average Ticket Size', reportData.summary.avgTx],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Exec Summary');

    const wsDetails = XLSX.utils.json_to_sheet(reportData.payments.map((p: any, idx: number) => ({
      '#': idx + 1,
      'Payment ID': p.id,
      'Date': p.date,
      'Customer ID': p.customer_id,
      'Customer Name': p.customer_name,
      'Scheme Type': p.ekub_type,
      'Round': p.round,
      'Amount (ETB)': p.amount,
      'Recorded By': p.recorded_by
    })));
    XLSX.utils.book_append_sheet(workbook, wsDetails, 'Transaction Logs');

    if (isAdmin && reportData.intelligence?.staffPerformance) {
      const wsIntelligence = XLSX.utils.json_to_sheet(reportData.intelligence.staffPerformance);
      XLSX.utils.book_append_sheet(workbook, wsIntelligence, 'Staff Performance');
    }

    XLSX.writeFile(workbook, `Yordi_Enterprise_Report_${dateRange.start}.xlsx`);
    toast.success('Multi-sheet Excel workbook generated');
  };

  const exportEnterprisePDF = () => {
    if (!reportData?.payments) return;
    const doc = new jsPDF() as any;

    doc.setFillColor(9, 26, 43);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('YORDI EQUIB', 14, 25);
    doc.setFontSize(10);
    doc.text('Enterprise Financial Audit Report', 14, 32);

    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.text(`Doc ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 150, 20);
    doc.text(`Security Level: ${isAdmin ? 'ADMINISTRATIVE' : 'OPERATIONAL'}`, 150, 25);
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 150, 30);

    doc.setDrawColor(230);
    doc.line(14, 50, 196, 50);
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('FINANCIAL OVERVIEW', 14, 60);

    doc.setFontSize(10);
    doc.text(`Total Collected Volume: ETB ${reportData.summary.totalVolume.toLocaleString()}`, 14, 70);
    doc.text(`Unique Transactions: ${reportData.summary.txCount}`, 14, 77);
    doc.text(`Reporting Period: ${dateRange.start} to ${dateRange.end}`, 14, 84);

    (doc as any).autoTable({
      startY: 95,
      head: [['#', 'DATE', 'IDENTIFIER', 'CUSTOMER', 'SCHEME', 'AMOUNT']],
      body: reportData.payments.map((p: any, idx: number) => [
        idx + 1,
        new Date(p.date).toLocaleDateString(),
        p.customer_id,
        p.customer_name,
        p.ekub_type,
        Number(p.amount).toLocaleString()
      ]),
      headStyles: { fillColor: [9, 26, 43], fontSize: 9, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.line(14, finalY, 70, finalY);
    doc.text('Authorized Signature', 14, finalY + 5);
    doc.text('Date', 14, finalY + 12);

    doc.save(`YORDI_AUDIT_${dateRange.start}.pdf`);
    toast.success('Enterprise PDF generated and signed');
  };

  const CATEGORIES = [
    { id: 'financial', label: 'Financial Audit', icon: <DollarSign size={18} />, adminOnly: false },
    { id: 'growth', label: 'Member Growth', icon: <TrendingUp size={18} />, adminOnly: true },
    { id: 'staff', label: 'Staff Performance', icon: <UserCheck size={18} />, adminOnly: true },
    { id: 'ops', label: 'Operational Velocity', icon: <Zap size={18} />, adminOnly: false },
  ];

  const filteredPayments = reportData?.payments?.filter((p: any) =>
    p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
          <p className="text-gray-500 text-sm mt-1">Financial auditing & performance metrics</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={exportEnterprisePDF}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <FileText size={16} className="text-rose-500" />
            Export PDF
          </button>
          <button
            onClick={exportAdvancedExcel}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-all"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Intelligence Selector & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 mb-2">Report Categories</p>
          {CATEGORIES.filter(c => !c.adminOnly || isAdmin).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${activeCategory === cat.id
                  ? 'bg-white border-gray-300 shadow-sm text-gray-900'
                  : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${activeCategory === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {cat.icon}
                </div>
                <span className="text-sm font-medium">{cat.label}</span>
              </div>
              <ChevronRight size={16} className={activeCategory === cat.id ? 'text-gray-400' : 'hidden'} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-xs font-medium text-gray-500">Reporting Period</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 text-sm"
                    />
                  </div>
                  <span className="text-gray-400">to</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 text-sm"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={fetchReport}
                className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Chart Section */}
            <div className="mt-6 h-80">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-400 mt-3">Loading data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {activeCategory === 'staff' ? (
                    <BarChart data={reportData?.intelligence?.staffPerformance || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="full_name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `ETB ${v}`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="total_volume" fill="#091A2B" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  ) : activeCategory === 'ops' ? (
                    <BarChart data={reportData?.opsTrend || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(v) => [`${v} Payments`, 'Throughput']} />
                      <Bar dataKey="count" fill="#4a7c9c" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  ) : activeCategory === 'growth' ? (
                    <LineChart data={reportData?.growthTrend || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Line type="monotone" dataKey="count" stroke="#091A2B" strokeWidth={2} dot={{ r: 4, fill: '#091A2B' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : (
                    <AreaChart data={reportData?.financialTrend || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#091A2B" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#091A2B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Area type="monotone" dataKey="amount" stroke="#091A2B" strokeWidth={2} fill="url(#velocityGrad)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Net Volume</p>
              <p className="text-xl font-bold text-gray-900 mt-1">ETB {reportData?.summary?.totalVolume.toLocaleString() || '0'}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Transactions</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{reportData?.summary?.txCount || '0'}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Average Amount</p>
              <p className="text-xl font-bold text-gray-900 mt-1">ETB {Math.round(reportData?.summary?.avgTx || 0).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Growth Index</p>
              <p className="text-xl font-bold text-gray-900 mt-1">+{reportData?.growthTrend?.length || 0}%</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Transaction Ledger</h3>
            <p className="text-xs text-gray-500 mt-0.5">Audit trail of all transactions</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by customer or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((p: any, idx: number) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{p.customer_name}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{p.customer_id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{p.ekub_type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.recorded_by ? p.recorded_by.split(' ')[0] : 'System'}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">ETB {Number(p.amount).toLocaleString()}</td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}