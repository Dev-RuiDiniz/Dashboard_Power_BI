'use client';

import { useCallback, useEffect, useRef } from 'react';

import { clearAuthSession, getAuthSession } from './session';
import { logout } from './api';

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart'];

export function useInactivityTimeout(onTimeout?: () => void, timeoutMs = DEFAULT_TIMEOUT_MS): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const performLogout = useCallback(async () => {
    const session = getAuthSession();

    try {
      if (session) {
        await logout(session.refreshToken, session.accessToken);
      }
    } catch {
      // best effort — clear local session regardless
    } finally {
      clearAuthSession();
      onTimeout?.();
    }
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    clearTimer();

    timerRef.current = setTimeout(() => {
      void performLogout();
    }, timeoutMs);
  }, [clearTimer, performLogout, timeoutMs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!getAuthSession()) return;

    resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    return () => {
      clearTimer();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [resetTimer, clearTimer]);
}
