'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        setError('Invalid phone number or password');
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
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden md:block md:w-1/2 lg:w-2/3 relative h-full">
        <Image
          src="/lp2.jpg"
          alt="YORDI EQUIB System"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Content overlay on image */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">YORDI EQUIB</h3>
              <p className="text-white/60 text-xs">Traditional EKUB Management</p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Ethiopian Traditional <br />
              <span className="text-[#016cc4]">EKUB Management</span> Platform
            </h2>
            <p className="text-white/70 text-sm lg:text-base">
              Manage contributions, members, payouts, and reporting in one secure platform built for mobile, tablet, and desktop.
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white/80 text-xs">500+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-white/80 text-xs">5 EKUB Types</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-white/80 text-xs">24/7 Support</span>
              </div>
            </div>
          </div>

          <div className="text-white/40 text-xs">
            © 2024 YORDI EQUIB SYSTEM. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 md:w-1/2 lg:w-1/3 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6 md:p-8 h-full overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[32px] border border-gray-300 shadow-[0_30px_70px_rgba(0,0,0,0.2)]">
          {/* Logo */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="YORDI EQUIB Logo"
                width={180}
                height={180}
                className="object-contain w-32 sm:w-40 md:w-48 h-auto"
                priority
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#016cc4] transition-colors z-10" size={18} />
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition-all bg-white"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#016cc4] transition-colors z-10" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none transition-all bg-white"
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-xs sm:text-sm text-[#016cc4] hover:underline transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#016cc4] to-[#0158a3] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#016cc4]/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
  );
}