'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react';

interface SessionTimeoutWarningProps {
  visible: boolean;
  secondsLeft: number;
  onKeepAlive: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutWarning({
  visible,
  secondsLeft,
  onKeepAlive,
  onLogout,
}: SessionTimeoutWarningProps) {
  if (!visible) return null;

  const pct = Math.max(0, (secondsLeft / 30) * 100);
  const isUrgent = secondsLeft <= 10;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slideUp">
        {/* Colored top bar — pulses red when urgent */}
        <div className={`h-1.5 w-full transition-colors duration-500 ${isUrgent ? 'bg-red-500' : 'bg-amber-400'}`}>
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${isUrgent ? 'bg-red-300' : 'bg-amber-200'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="p-7 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors duration-500 ${
            isUrgent ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <ShieldAlert size={32} className={isUrgent ? 'animate-pulse' : ''} />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Session Expiring</h2>
          <p className="text-sm text-gray-500 mb-5">
            You've been inactive. Your session will automatically end in:
          </p>

          {/* Countdown */}
          <div className={`text-5xl font-black mb-6 tabular-nums transition-colors duration-300 ${
            isUrgent ? 'text-red-500' : 'text-amber-500'
          }`}>
            {String(secondsLeft).padStart(2, '0')}
            <span className="text-base font-medium text-gray-400 ml-1">sec</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onKeepAlive}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#016cc4] hover:bg-[#0158a3] text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <RefreshCw size={16} />
              Stay Logged In
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-xl font-semibold transition-all duration-200"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn  { animation: fadeIn  0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.25s ease-out; }
      `}</style>
    </div>
  );
}
