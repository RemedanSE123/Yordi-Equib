'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import SessionTimeoutWarning from '@/components/dashboard/session-timeout-warning';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';

// ── Timing config ──────────────────────────────────────────────────────────────
const IDLE_WARNING_AFTER_SEC = 5 * 60;  // 5 min idle → show warning
const WARNING_COUNTDOWN_SEC  = 30;       // 30 sec countdown → auto-logout

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Session timeout state ──────────────────────────────────────────────────
  const [showWarning, setShowWarning]   = useState(false);
  const [countdown, setCountdown]       = useState(WARNING_COUNTDOWN_SEC);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(WARNING_COUNTDOWN_SEC);
    setShowWarning(true);
    clearCountdown();

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown]);

  const handleTimeout = useCallback(() => {
    clearCountdown();
    setShowWarning(false);
    signOut({ callbackUrl: '/login' });
  }, [clearCountdown]);

  const handleKeepAlive = useCallback(() => {
    clearCountdown();
    setShowWarning(false);
    setCountdown(WARNING_COUNTDOWN_SEC);
    keepAlive();          // resets the idle timers in the hook
  }, [clearCountdown]);   // keepAlive defined below via forward ref pattern

  // ── Idle hook ──────────────────────────────────────────────────────────────
  // We use a ref-based keepAlive so handleKeepAlive can call it without
  // a circular dependency.
  const keepAliveRef = useRef<() => void>(() => {});

  const { keepAlive } = useIdleTimeout({
    warningAfter: IDLE_WARNING_AFTER_SEC,
    timeoutAfter: WARNING_COUNTDOWN_SEC,
    onWarning: startCountdown,
    onTimeout: handleTimeout,
  });

  // Sync keepAlive into ref so handleKeepAlive can call it
  useEffect(() => {
    keepAliveRef.current = keepAlive;
  }, [keepAlive]);

  // Auto-logout when countdown hits zero
  useEffect(() => {
    if (countdown === 0 && showWarning) {
      handleTimeout();
    }
  }, [countdown, showWarning, handleTimeout]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Session Timeout Warning Overlay ── */}
      <SessionTimeoutWarning
        visible={showWarning}
        secondsLeft={countdown}
        onKeepAlive={() => {
          keepAliveRef.current();
          clearCountdown();
          setShowWarning(false);
          setCountdown(WARNING_COUNTDOWN_SEC);
        }}
        onLogout={handleTimeout}
      />
    </div>
  );
}
