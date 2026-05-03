'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PaymentStatusProps {
  ekubs: any[];
}

export default function PaymentStatus({ ekubs }: PaymentStatusProps) {
  const completed = ekubs.reduce((sum, e) => sum + Math.floor(e.totalPayouts / 1000), 0);
  const pending = ekubs.reduce((sum, e) => sum + (e.activeMembers - Math.floor(e.totalPayouts / 1000)), 0);

  const data = [
    { name: 'Completed', value: Math.max(1, completed) },
    { name: 'Pending', value: Math.max(1, pending) },
  ];

  const COLORS = ['#4caf50', '#ff9800'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Status Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
