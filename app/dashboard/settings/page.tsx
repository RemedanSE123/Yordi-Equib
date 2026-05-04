'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Save, ShieldAlert, Lock, CheckCircle2, AlertCircle, RefreshCw, User, Bell, Globe, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState({
    organizationName: 'YORDI EQUIB SYSTEM',
    defaultCurrency: 'ETB',
    yearFormat: 'ethiopian',
    timeZone: 'Africa/Addis_Ababa',
    emailNotifications: true,
    smsNotifications: false,
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [saved, setSaved] = useState(false);

  const userRole = (session?.user as any)?.role;
  const isAdminOrManager = userRole === 'ADMIN' || userRole === 'MANAGER';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrManager) return;

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.success('System settings updated');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (passwordData.new.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    setPasswordStatus(null);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
        setPasswordData({ current: '', new: '', confirm: '' });
        toast.success('Password updated');
      } else {
        setPasswordStatus({ type: 'error', message: data.error || 'Failed to update password' });
        toast.error(data.error || 'Password update failed');
      }
    } catch (error) {
      setPasswordStatus({ type: 'error', message: 'Connection error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your profile and security preferences</p>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 text-center">
            <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Security & Password</h2>
            <p className="text-sm text-gray-500 mt-1">Update your account credentials to keep your profile secure</p>
          </div>

          <div className="p-6">
            {passwordStatus && (
              <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${passwordStatus.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                {passwordStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 focus:bg-white outline-none transition-all text-gray-900"
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 focus:bg-white outline-none transition-all text-gray-900"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 focus:bg-white outline-none transition-all text-gray-900"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <ShieldAlert size={16} />
                )}
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* User Info Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
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
                <span className="text-sm text-gray-500"> Phone</span>
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