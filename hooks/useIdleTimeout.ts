'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  /** Seconds of inactivity before onWarning fires */
  warningAfter: number;
  /** Seconds after warning before onTimeout fires */
  timeoutAfter: number;
  onWarning: () => void;
  onTimeout: () => void;
  onActivity?: () => void;
}

const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keydown',
  'touchstart', 'touchmove', 'scroll', 'click',
];

export function useIdleTimeout({
  warningAfter,
  timeoutAfter,
  onWarning,
  onTimeout,
  onActivity,
}: UseIdleTimeoutOptions) {
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warned       = useRef(false);

  const clearTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current)  clearTimeout(logoutTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    warned.current = false;
    onActivity?.();

    warningTimer.current = setTimeout(() => {
      warned.current = true;
      onWarning();
      logoutTimer.current = setTimeout(() => {
        onTimeout();
      }, timeoutAfter * 1000);
    }, warningAfter * 1000);
  }, [clearTimers, warningAfter, timeoutAfter, onWarning, onTimeout, onActivity]);

  useEffect(() => {
    // Start timers on mount
    resetTimers();

    const handler = () => {
      // Only reset if we are not in the final countdown window
      if (!warned.current) {
        resetTimers();
      }
    };

    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, handler, { passive: true }));

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, handler));
    };
  }, [resetTimers, clearTimers]);

  /** Call this when user clicks "Stay Logged In" in the warning dialog */
  const keepAlive = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  return { keepAlive };
}
