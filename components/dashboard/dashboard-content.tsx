'use client';

import { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import KPICards from './kpi-cards';
import EkubChart from './ekub-chart';
import PaymentStatus from './payment-status';
import { useSession } from 'next-auth/react';
import { BellRing, Search, Users, TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';

export default function DashboardContent() {
  const [ekubs, setEkubs] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    // Load dashboard data
    const timer = setTimeout(() => {
      // 5 EKUB Types data
      setEkubs([
        {
          id: '1',
          name: 'Daily EKUB',
          type: 'daily',
          totalContributions: 125000,
          todayCollection: 4250,
          totalPayouts: 4000,
          totalUsers: 45,
          currentRound: 5,
          totalRounds: 30,
          membersPaidToday: 38,
        },
        {
          id: '2',
          name: 'Weekly EKUB',
          type: 'weekly',
          totalContributions: 87500,
          todayCollection: 3200,
          totalPayouts: 6000,
          totalUsers: 32,
          currentRound: 3,
          totalRounds: 60,
          membersPaidToday: 28,
        },
        {
          id: '3',
          name: 'Monthly EKUB',
          type: 'monthly',
          totalContributions: 72000,
          todayCollection: 2800,
          totalPayouts: 4000,
          totalUsers: 28,
          currentRound: 2,
          totalRounds: 14,
          membersPaidToday: 24,
        },
        {
          id: '4',
          name: '105 Days EKUB',
          type: '105-days',
          totalContributions: 63200,
          todayCollection: 1950,
          totalPayouts: 2100,
          totalUsers: 24,
          currentRound: 15,
          totalRounds: 107,
          membersPaidToday: 19,
        },
        {
          id: '5',
          name: 'Share EKUB',
          type: 'share',
          totalContributions: 54800,
          todayCollection: 1680,
          totalPayouts: 1900,
          totalUsers: 20,
          currentRound: 25,
          totalRounds: 60,
          membersPaidToday: 16,
        },
      ]);

      // Recent payments data
      setRecentPayments([
        {
          id: 'P001',
          customerName: 'Almaz Tadese',
          customerId: 'C001',
          ekubType: 'Daily EKUB',
          amount: 100,
          date: '2024-01-15',
          time: '10:30 AM',
          round: 5,
        },
        {
          id: 'P002',
          customerName: 'Kebede Desta',
          customerId: 'C002',
          ekubType: 'Daily EKUB',
          amount: 100,
          date: '2024-01-15',
          time: '10:45 AM',
          round: 5,
        },
        {
          id: 'P003',
          customerName: 'Tigist Mengistu',
          customerId: 'C003',
          ekubType: 'Weekly EKUB',
          amount: 250,
          date: '2024-01-15',
          time: '11:00 AM',
          round: 3,
        },
        {
          id: 'P004',
          customerName: 'Solomon Alemu',
          customerId: 'C004',
          ekubType: 'Weekly EKUB',
          amount: 250,
          date: '2024-01-15',
          time: '11:20 AM',
          round: 3,
        },
        {
          id: 'P005',
          customerName: 'Meseret Bekele',
          customerId: 'C005',
          ekubType: 'Monthly EKUB',
          amount: 300,
          date: '2024-01-15',
          time: '11:45 AM',
          round: 2,
        },
        {
          id: 'P006',
          customerName: 'Getachew Worku',
          customerId: 'C006',
          ekubType: 'Monthly EKUB',
          amount: 300,
          date: '2024-01-15',
          time: '12:00 PM',
          round: 2,
        },
        {
          id: 'P007',
          customerName: 'Hana Abebe',
          customerId: 'C007',
          ekubType: '105 Days EKUB',
          amount: 50,
          date: '2024-01-15',
          time: '01:15 PM',
          round: 15,
        },
        {
          id: 'P008',
          customerName: 'Dawit Mekonnen',
          customerId: 'C008',
          ekubType: 'Share EKUB',
          amount: 60,
          date: '2024-01-15',
          time: '01:30 PM',
          round: 25,
        },
      ]);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const totalContributions = ekubs.reduce((sum, e) => sum + e.totalContributions, 0);
  const totalPayouts = ekubs.reduce((sum, e) => sum + e.totalPayouts, 0);
  const totalUsers = ekubs.reduce((sum, e) => sum + e.totalUsers, 0);
  const todayTotalCollection = ekubs.reduce((sum, e) => sum + e.todayCollection, 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name || 'User'}!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#016cc4] w-64"
            />
          </div>
          <button className="relative p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <BellRing size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Changed Active Ekubs to Total Customers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Collected</p>
              <p className="text-3xl font-bold mt-2">ETB {totalContributions.toLocaleString()}</p>
            </div>
            <DollarSign size={40} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Today's Collection</p>
              <p className="text-3xl font-bold mt-2">ETB {todayTotalCollection.toLocaleString()}</p>
            </div>
            <TrendingUp size={40} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total company Users </p>
              <p className="text-3xl font-bold mt-2">{ekubs.length}</p>
            </div>
            <Calendar size={40} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-2">{totalUsers}</p>
            </div>
            <Users size={40} className="text-blue-200" />
          </div>
        </div>
      </div>

      {/* Charts Section - Bar Chart (Contributions only) & Pie Chart (5 EKUB types collected money) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Bar Chart - Contributions only (no payouts) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contributions by EKUB Type</h2>
          <div className="space-y-4">
            {ekubs.map((ekub) => (
              <div key={ekub.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{ekub.name}</span>
                  <span className="font-semibold text-gray-900">ETB {ekub.totalContributions.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#016cc4] to-[#0158a3] h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-medium"
                    style={{ width: `${(ekub.totalContributions / totalContributions) * 100}%` }}
                  >
                    {((ekub.totalContributions / totalContributions) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart - 5 EKUB types collected money */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Collected Money by EKUB Type</h2>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {(() => {
                    let currentAngle = 0;
                    const colors = ['#016cc4', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
                    return ekubs.map((ekub, index) => {
                      const percentage = (ekub.totalContributions / totalContributions) * 100;
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;
                      currentAngle = endAngle;

                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;

                      const x1 = 50 + 40 * Math.cos(startRad);
                      const y1 = 50 + 40 * Math.sin(startRad);
                      const x2 = 50 + 40 * Math.cos(endRad);
                      const y2 = 50 + 40 * Math.sin(endRad);

                      const largeArc = angle > 180 ? 1 : 0;

                      return (
                        <path
                          key={ekub.id}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[index]}
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        />
                      );
                    });
                  })()}
                  <circle cx="50" cy="50" r="25" fill="white" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ekubs.map((ekub, index) => {
                const colors = ['#016cc4', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
                const percentage = ((ekub.totalContributions / totalContributions) * 100).toFixed(1);
                return (
                  <div key={ekub.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                    <span className="text-xs text-gray-600 flex-1">{ekub.name}</span>
                    <span className="text-xs font-semibold text-gray-900">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Table - 5 rows for each EKUB type */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">EKUB Types Summary</h2>
              <p className="text-sm text-gray-500 mt-1">Overview of all 5 EKUB types</p>
            </div>
            <button className="px-3 py-1.5 text-sm bg-[#016cc4] text-white rounded-lg hover:bg-[#0158a3] transition-colors">
              Export Data
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">EKUB Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Number of Users</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Money Collected (ETB)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Today's Money Collected (ETB)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ekubs.map((ekub) => (
                  <tr key={ekub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-[#016cc4] rounded-lg text-xs font-medium">
                        {ekub.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{ekub.totalUsers}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ETB {ekub.totalContributions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      ETB {ekub.todayCollection.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#016cc4] h-2 rounded-full"
                            style={{ width: `${(ekub.currentRound / ekub.totalRounds) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{ekub.currentRound}/{ekub.totalRounds}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Payments Section */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Payments</h2>
              <p className="text-sm text-gray-500 mt-1">Latest customer payment transactions</p>
            </div>
            <Clock size={20} className="text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{payment.customerName}</p>
                    <p className="text-xs text-gray-500">{payment.customerId} • {payment.ekubType} • Round {payment.round}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">ETB {payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{payment.date} at {payment.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}