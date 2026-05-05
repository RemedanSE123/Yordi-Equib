'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  BellRing, Search, Users, TrendingUp, Calendar, DollarSign, Clock,
  ChevronLeft, ChevronRight, User, Database, ArrowUpRight, ArrowDownRight,
  CreditCard, Wallet, PieChart, Activity, Zap, Target, Award, Home,
  BarChart3, CircleDollarSign, Layers, CalendarDays, CalendarRange,
  MoreHorizontal, Eye, Download, Sparkles, TrendingDown, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export default function DashboardContent() {
  const [ekubs, setEkubs] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [totals, setTotals] = useState({ totalCollected: 0, todayTotal: 0, totalCustomers: 0 });
  const [trends, setTrends] = useState<any>({ weekly: [], monthly: [], yearly: [] });
  const [trendType, setTrendType] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null);
  const [hoveredPieSegment, setHoveredPieSegment] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data) {
          setEkubs(data.ekubs || []);
          setRecentPayments(data.recentPayments || []);
          setTotals(data.totals || { totalCollected: 0, todayTotal: 0, totalCustomers: 0 });
          setTrends(data.trends || { weekly: [], monthly: [], yearly: [] });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalContributions = totals.totalCollected;
  const todayTotalCollection = totals.todayTotal;
  const totalUsers = totals.totalCustomers;
  const totalGroups = ekubs.length;

  const currentTrendData = trends[trendType] || [];

  const totalPages = Math.ceil(recentPayments.length / paymentsPerPage);
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const paginatedPayments = recentPayments.slice(startIndex, startIndex + paymentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const pieChartData = ekubs.map(ekub => ({
    name: ekub.name,
    value: ekub.totalContributions,
  }));

  const COLORS = ['#091A2B', '#2c4c6e', '#4a7c9c', '#6b9cc0', '#8bbce4'];

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const kpiData = [
    { label: 'Total Collection', value: totalContributions, change: null, icon: Wallet, color: 'from-gray-800 to-gray-900', isCount: false },
    { label: "Today's Collection", value: todayTotalCollection, change: 'Real-time', icon: null, color: 'from-gray-700 to-gray-800', isCount: false },
    { label: 'Equib Types', value: totalGroups, change: 'EKUB Schemes', icon: PieChart, color: 'from-gray-800 to-gray-900', isCount: true },
    { label: 'Total Customers', value: totalUsers, change: null, icon: Users, color: 'from-gray-700 to-gray-800', isCount: true }
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 animate-fadeIn">
        <div className="animate-slideInLeft">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {session?.user?.name || 'User'}</p>
        </div>
      </div>

      {/* Animated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpiData.map((kpi, idx) => (
          <div
            key={idx}
            className="group relative bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden"
            onMouseEnter={() => setHoveredKpi(idx)}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-gray-100 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide group-hover:text-gray-700 transition-colors duration-300">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:scale-105 transition-transform duration-300 origin-left">
                  {kpi.isCount ? kpi.value.toLocaleString() : `ETB ${kpi.value.toLocaleString()}`}
                </p>
                <div className="flex items-center gap-1 mt-3">
                  {kpi.change && (idx === 1 || idx === 2) ? (
                    <div className="px-2 py-0.5 bg-gray-100 rounded-full group-hover:scale-105 transition-transform">
                      <span className="text-gray-600 text-xs font-medium">{kpi.change}</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                {idx === 1 ? (
                  <span className="text-white font-bold text-base">Br</span>
                ) : kpi.icon ? (
                  <kpi.icon size={22} className="text-white" />
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Animated Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="group bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">Collection Trend</h3>
              <p className="text-gray-400 text-xs mt-1">Revenue analytics over time</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {(['weekly', 'monthly', 'yearly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTrendType(type)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${trendType === type
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={currentTrendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#091A2B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#091A2B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxisTick} width={50} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [`ETB ${value.toLocaleString()}`, 'Total Collected']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#091A2B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAmount)"
                className="group-hover:stroke-3 transition-all duration-300"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="group bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">Money Distribution</h3>
              <p className="text-gray-400 text-xs mt-1">By EKUB type</p>
            </div>
          </div>
          {pieChartData.length > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                        className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:scale-110"
                        onMouseEnter={() => setHoveredPieSegment(index)}
                        onMouseLeave={() => setHoveredPieSegment(null)}
                        style={{
                          transform: hoveredPieSegment === index ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`ETB ${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 pointer-events-none rounded-full animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ boxShadow: '0 0 0 0 rgba(9,26,43,0.1)' }}></div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-400 text-sm">No data available</p>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-2 border-t border-gray-100">
            {pieChartData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-2 group/pie cursor-pointer transition-all duration-300 hover:scale-105"
                onMouseEnter={() => setHoveredPieSegment(index)}
                onMouseLeave={() => setHoveredPieSegment(null)}
              >
                <div
                  className="w-3 h-3 rounded-full transition-all duration-300 group-hover/pie:scale-110"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-600 group-hover/pie:text-gray-900 transition-colors duration-300">{item.name}</span>
                <span className="text-xs font-semibold text-gray-900">{((item.value / totalContributions) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EKUB Overview Table - Clean & Professional */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900">EKUB Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">Performance metrics by group</p>
          </div>
          <button className="flex items-center gap-2 text-xs text-gray-600 font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Download size={14} />
            Export Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Types of Equib</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No of Customers</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Collections</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Today's Collection</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ekubs.map((ekub, idx) => (
                <tr key={ekub.type} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-white font-semibold text-xs">
                        {ekub.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{ekub.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ekub.totalUsers}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">ETB {ekub.totalContributions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">ETB {ekub.todayCollection.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gray-800 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(ekub.currentRound / ekub.totalRounds) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{ekub.currentRound}/{ekub.totalRounds}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions Table - Clean & Professional */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest payment activity</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Page {currentPage} of {totalPages || 1}</span>
            <div className="flex gap-1">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-1.5 rounded border border-gray-300 disabled:opacity-30 hover:bg-gray-50 transition">
                <ChevronLeft size={14} className="text-gray-600" />
              </button>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-1.5 rounded border border-gray-300 disabled:opacity-30 hover:bg-gray-50 transition">
                <ChevronRight size={14} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer ID</th>

                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Equib Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Round</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div><p className="text-sm text-gray-500 mt-2">Loading...</p></td></tr>
              ) : paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment, idx) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-xs text-gray-400">{(currentPage - 1) * paymentsPerPage + idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={12} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{payment.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{payment.customer_id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{payment.ekub_type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.round}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.period ?? '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">ETB {payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(payment.date)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0% { box-shadow: 0 0 0 0 rgba(9,26,43,0.1); }
          70% { box-shadow: 0 0 0 20px rgba(9,26,43,0); }
          100% { box-shadow: 0 0 0 0 rgba(9,26,43,0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.5s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s infinite; }
      `}</style>
    </div>
  );
}