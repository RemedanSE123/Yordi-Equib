'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Eye, EyeOff, LogIn, Shield, Users, TrendingUp, Award, ChevronRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const stats = [
    { value: '99.9%', label: 'Customer Satisfaction' },
    { value: '400+', label: 'Active Customers' },
    { value: '24/7', label: 'Support Available' },
  ];

  const features = [
    'Real-time Analytics',
    'Secure System',
    'Track Payments',
    'Customer Management',
    'Mobile Friendly',
    'Generate Reports'
  ];

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
        setError('Invalid phone number or password');
      } else if (result?.ok) {
        const session = await getSession();
        const role = (session?.user as any)?.role;
        if (role === 'ADMIN') {
          router.push('/dashboard/users');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Professional Image Section */}
      <div className="hidden md:block md:w-1/2 lg:w-2/3 relative h-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/lp2.jpg"
            alt="YORDI EQUIB System"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Sophisticated Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/20" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-10 lg:p-12 z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base tracking-wide">YORDI EQUIB</h3>
                <p className="text-white/50 text-xs">Enterprise Management System</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-10 max-w-lg">
            <div className="space-y-4">
              

              <h1 className="max-w-xl font-sans text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                <span className="block whitespace-nowrap">
                  YORDI <span className="bg-linear-to-r from-[#2ba3fe] via-[#0186f4] to-white bg-clip-text text-transparent">EQUIB</span>
                </span>
             
              </h1>

              <div className="h-px w-24 bg-linear-to-r from-[#016cc4] to-transparent" />

              <p className="text-white/70 text-base leading-relaxed max-w-md">
                Comprehensive platform for managing contributions, members, and payouts with enterprise-grade security and real-time analytics.
              </p>
            </div>

            {/* KPI Stats Row */}
            <div className="flex gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/50 text-xs uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features Section - Professional with Green Check Icons */}
            <div className="space-y-4">
              <div className="text-white/60 text-xs uppercase tracking-wider font-semibold">
                PLATFORM CAPABILITIES
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-white/80 text-sm font-light">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer with Dynamic Year */}
          <div className="flex justify-between items-center text-white/30 text-xs">
            <div>© {currentYear} YORDI EQUIB SYSTEM. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/50 transition">Privacy</a>
              <a href="#" className="hover:text-white/50 transition">Security</a>
              <a href="#" className="hover:text-white/50 transition">Contact</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Clean Login Form (No Horizontal Scroll) */}
      <div className="flex-1 md:w-1/2 lg:w-1/3 flex items-center justify-center bg-white p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          <div className="space-y-8">
            {/* Logo */}
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="relative p-2 rounded-3xl bg-linear-to-br from-blue-50 to-white shadow-[0_0_40px_rgba(1,108,196,0.18)] border border-blue-100">
                  <Image
                    src="/logo.png"
                    alt="YORDI EQUIB Logo"
                    width={220}
                    height={220}
                    className="object-contain w-40 sm:w-48 h-auto drop-shadow-md"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-2">

                <h2 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-[#016cc4] to-gray-800 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="text-sm text-gray-400">Sign in to access your YORDI EQUIB account</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#016cc4] focus:border-[#016cc4] outline-none transition-all bg-white"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#016cc4] focus:border-[#016cc4] outline-none transition-all bg-white"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>



              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#016cc4] hover:bg-[#0158a3] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}