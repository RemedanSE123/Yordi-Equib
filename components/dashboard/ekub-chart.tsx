'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EkubChartProps {
  ekubs: any[];
}

export default function EkubChart({ ekubs }: EkubChartProps) {
  const data = ekubs.map(ekub => ({
    name: ekub.type.charAt(0).toUpperCase() + ekub.type.slice(1),
    contributions: ekub.totalContributions,
    payouts: ekub.totalPayouts,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Contributions vs Payouts</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `Br ${value}`} />
          <Legend />
          <Bar dataKey="contributions" fill="#016cc4" />
          <Bar dataKey="payouts" fill="#4caf50" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
