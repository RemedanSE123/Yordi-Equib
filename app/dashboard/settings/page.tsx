'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Save, ShieldAlert } from 'lucide-react';

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
  const [saved, setSaved] = useState(false);

  const userRole = (session?.user as any)?.role;

  if (userRole !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md p-8 rounded-3xl border border-red-100 bg-red-50/50 backdrop-blur">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-950 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access and modify system settings. Please contact your manager if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-950">Settings</h1>
        <p className="text-gray-600 mt-2">Configure system preferences and options</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Settings */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950 mb-4">Organization Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              >
                <option value="ETB">Ethiopian Birr (ETB)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Localization Settings */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950 mb-4">Localization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendar Format
              </label>
              <select
                value={settings.yearFormat}
                onChange={(e) => setSettings({ ...settings, yearFormat: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              >
                <option value="gregorian">Gregorian Calendar</option>
                <option value="ethiopian">Ethiopian Calendar</option>
                <option value="both">Both (Dual Display)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Zone
              </label>
              <select
                value={settings.timeZone}
                onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              >
                <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-950">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email alerts for important events</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="h-6 w-6 accent-primary cursor-pointer"
                />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-950">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive SMS alerts for critical updates</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="h-6 w-6 accent-primary cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950 mb-4">System Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <p className="text-gray-600 font-medium">System Version</p>
              <p className="font-bold text-gray-950">1.0.0</p>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <p className="text-gray-600 font-medium">Last Updated</p>
              <p className="font-bold text-gray-950">2026-05-03</p>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <p className="text-gray-600 font-medium">Database</p>
              <p className="font-bold text-gray-950">PostgreSQL</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl hover:bg-opacity-90 transition shadow-lg shadow-primary/20 font-bold"
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
