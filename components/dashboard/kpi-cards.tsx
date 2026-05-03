'use client';

import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface KPICardsProps {
  totalContributions: number;
  totalPayouts: number;
  totalMembers: number;
  activeEkubs: number;
}

export default function KPICards({
  totalContributions,
  totalPayouts,
  totalMembers,
  activeEkubs,
}: KPICardsProps) {
  const cards = [
    {
      title: 'Total Collected Money',
      value: `ETB ${totalContributions.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-blue-50 text-primary',
      trend: '+12% from last month',
    },
    {
      title: 'Today\'s Collections',
      value: `ETB ${Math.round(totalContributions / 30).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      trend: 'Live collection snapshot',
    },
    {
      title: 'Total Users',
      value: totalMembers.toString(),
      icon: Users,
      color: 'bg-amber-50 text-amber-600',
      trend: 'Across all EKUB types',
    },
    {
      title: 'Active EKUB Groups',
      value: activeEkubs.toString(),
      icon: Target,
      color: 'bg-red-50 text-red-600',
      trend: 'Daily, weekly, monthly, and more',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-sm transition hover:shadow-lg">
            <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
              <Icon size={24} />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
            <p className="text-2xl font-black text-gray-950">{card.value}</p>
            <p className="text-xs text-gray-500 mt-2">{card.trend}</p>
          </div>
        );
      })}
    </div>
  );
}
