'use client';

import Sidebar from './sidebar';
import { Badge } from '@/components/ui/badge';

interface SectionPageProps {
  title: string;
  subtitle: string;
  badge: string;
}

export default function SectionPage({ title, subtitle, badge }: SectionPageProps) {
  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-sm md:p-8">
          <Badge className="mb-4 bg-[#016cc4] text-white hover:bg-[#016cc4]">{badge}</Badge>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">{title}</h1>
          <p className="mt-2 max-w-2xl text-gray-600">{subtitle}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
              <p className="text-sm text-gray-500">KPIs</p>
              <p className="mt-2 text-lg font-semibold text-gray-950">Users, money collected, paid vs unpaid</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
              <p className="text-sm text-gray-500">Tracking</p>
              <p className="mt-2 text-lg font-semibold text-gray-950">Rounds, winners, and payment indicators</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
              <p className="text-sm text-gray-500">Next step</p>
              <p className="mt-2 text-lg font-semibold text-gray-950">Connect PostgreSQL models and real data</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}