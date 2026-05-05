'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Save, ShieldAlert, Lock, CheckCircle2, XCircle, RefreshCw, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

// ── Password rule helpers ──────────────────────────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',  label: 'At least 8 characters',          test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: 'At least one uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'At least one lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',  label: 'At least one number (0-9)',       test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'At least one special character (@, #, $, !…)', test: (p: string) => /[@#$!%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function isPasswordValid(p: string) {
  return PASSWORD_RULES.every(r => r.test(p));
}

// ── Animated rule checklist ────────────────────────────────────────────────────
function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  return (
    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Password Requirements</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {PASSWORD_RULES.map(rule => {
          const ok = rule.test(password);
          return (
            <div
              key={rule.id}
              className={`flex items-center gap-1.5 text-xs transition-all duration-300 ${ok ? 'text-green-600' : 'text-red-500'}`}
            >
              {ok
                ? <CheckCircle2 size={13} className="flex-shrink-0" />
                : <XCircle size={13} className="flex-shrink-0" />}
              <span className={`transition-all duration-200 ${ok ? 'line-through text-green-500/70' : ''}`}>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Strength bar ───────────────────────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  const pct = (passed / PASSWORD_RULES.length) * 100;
  const color =
    pct <= 20 ? 'bg-red-500' :
    pct <= 40 ? 'bg-orange-500' :
    pct <= 60 ? 'bg-yellow-500' :
    pct <= 80 ? 'bg-blue-500' : 'bg-green-500';
  const label =
    pct <= 20 ? 'Very weak' :
    pct <= 40 ? 'Weak' :
    pct <= 60 ? 'Fair' :
    pct <= 80 ? 'Good' : 'Strong';

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-gray-400">Strength</span>
        <span className={`font-semibold ${color.replace('bg-', 'text-')}`}>{label}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const userRole = (session?.user as any)?.role;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid(passwordData.new)) {
      toast({
        title: '⚠️ Password Too Weak',
        description: 'Your new password does not meet all requirements. Please check the rules below.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: '❌ Passwords Do Not Match',
        description: 'The new password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new }),
      });
      const data = await res.json();

      if (res.ok) {
        toast({ title: '✅ Password Updated', description: 'Your password has been changed successfully.' });
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        toast({ title: '❌ Update Failed', description: data.error || 'Failed to update password.', variant: 'destructive' });
      }
    } catch {
      toast({ title: '⚠️ Connection Error', description: 'Could not reach the server. Please try again.', variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggle = (field: 'current' | 'new' | 'confirm') =>
    setShow(s => ({ ...s, [field]: !s[field] }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8">
      <Toaster />
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your profile and security preferences</p>
        </div>

        {/* ── Change Password Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 text-center">
            <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Security &amp; Password</h2>
            <p className="text-sm text-gray-500 mt-1">Update your account credentials to keep your profile secure</p>
          </div>

          <div className="p-6">
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={show.current ? 'text' : 'password'}
                    required
                    value={passwordData.current}
                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-[#016cc4] focus:bg-white outline-none transition-all text-gray-900"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => toggle('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={show.new ? 'text' : 'password'}
                    required
                    value={passwordData.new}
                    onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-[#016cc4] focus:bg-white outline-none transition-all text-gray-900"
                    placeholder="Enter new password"
                  />
                  <button type="button" onClick={() => toggle('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <StrengthBar password={passwordData.new} />
                <PasswordRules password={passwordData.new} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={show.confirm ? 'text' : 'password'}
                    required
                    value={passwordData.confirm}
                    onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:bg-white outline-none transition-all text-gray-900 ${
                      passwordData.confirm && passwordData.new !== passwordData.confirm
                        ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                        : passwordData.confirm && passwordData.new === passwordData.confirm
                        ? 'border-green-400 focus:ring-green-300 focus:border-green-400'
                        : 'border-gray-200 focus:ring-[#016cc4] focus:border-[#016cc4]'
                    }`}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" onClick={() => toggle('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordData.confirm && passwordData.new !== passwordData.confirm && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <XCircle size={12} /> Passwords do not match
                  </p>
                )}
                {passwordData.confirm && passwordData.new === passwordData.confirm && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordLoading || !isPasswordValid(passwordData.new) || passwordData.new !== passwordData.confirm}
                className="w-full py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {passwordLoading ? <RefreshCw size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* ── Account Info Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 text-center">
            <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <User size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            <p className="text-sm text-gray-500 mt-1">Your profile details</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Name</span>
                <span className="text-sm font-medium text-gray-900">{session?.user?.name || 'User'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Phone</span>
                <span className="text-sm font-medium text-gray-900">{(session?.user as any)?.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{userRole?.toLowerCase() || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}