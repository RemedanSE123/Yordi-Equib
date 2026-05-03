'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Smartphone, Users, Wallet } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f4f9ff_0%,#e8f2fb_52%,#dbeafe_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <div className="flex flex-1 items-center px-6 py-10 lg:px-12 xl:px-16">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#016cc4]/15 bg-white/70 px-4 py-2 text-sm font-medium text-[#016cc4] shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[#016cc4]" />
              Ethiopian Traditional EKUB Management Platform
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              YORDI EQUIB SYSTEM
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Manage EKUB contributions, members, payouts, and reporting in one secure platform built for mobile, tablet, and desktop.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                <ShieldCheck className="h-5 w-5 text-[#016cc4]" />
                <p className="mt-3 text-sm font-semibold text-slate-900">Role-based access</p>
                <p className="mt-1 text-sm text-slate-600">Admin, Manager, Secretary, Employee, and Customer flows.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                <Smartphone className="h-5 w-5 text-[#016cc4]" />
                <p className="mt-3 text-sm font-semibold text-slate-900">Mobile first</p>
                <p className="mt-1 text-sm text-slate-600">Responsive dashboard layouts and login experience.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                <Users className="h-5 w-5 text-[#016cc4]" />
                <p className="mt-3 text-sm font-semibold text-slate-900">Member management</p>
                <p className="mt-1 text-sm text-slate-600">Track users, customers, and round participation.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
                <Wallet className="h-5 w-5 text-[#016cc4]" />
                <p className="mt-3 text-sm font-semibold text-slate-900">ETB reporting</p>
                <p className="mt-1 text-sm text-slate-600">Clear payment totals and payout visibility.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10 lg:px-12 lg:py-10">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_20px_80px_rgba(1,108,196,0.12)] backdrop-blur-xl">
            <div className="mb-8 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#016cc4] text-2xl font-black text-white shadow-lg shadow-[#016cc4]/25">
                YE
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Sign in to continue
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Use your phone number and password to access the system.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+251901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#016cc4] focus:ring-4 focus:ring-[#016cc4]/10"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#016cc4] focus:ring-4 focus:ring-[#016cc4]/10"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#016cc4] px-4 text-sm font-semibold text-white transition hover:bg-[#0157a0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Demo credentials: <span className="font-semibold text-slate-900">+251901234567</span> / <span className="font-semibold text-slate-900">Yordi@321#</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
