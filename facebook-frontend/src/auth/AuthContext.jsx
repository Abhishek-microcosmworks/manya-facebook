import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { clearAuth, loadAuth, saveAuth } from '../lib/storage';

function isExpired(expiry) {
  const t = new Date(expiry).getTime();
  if (!Number.isFinite(t)) return true;
  return Date.now() >= t;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const existing = loadAuth();
    if (existing && !isExpired(existing.expiry)) {
      setAccessToken(existing.accessToken);
      setExpiry(existing.expiry);
      setUser(existing.user || null);
    } else {
      clearAuth();
    }
    setIsReady(true);
  }, []);

  const setSession = useCallback((next) => {
    setAccessToken(next?.accessToken || null);
    setExpiry(next?.expiry || null);
    setUser(next?.user || null);

    if (next?.accessToken && next?.expiry) saveAuth(next);
    else clearAuth();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await apiRequest('/login', {
      method: 'POST',
      body: { email, password },
    });

    setSession({
      accessToken: data?.accessToken,
      expiry: data?.expiry,
      user: data?.user,
    });

    return data;
  }, [setSession]);

  const register = useCallback(async ({ name, email, password, confirmPassword, acceptTerms }) => {
    return apiRequest('/register', {
      method: 'POST',
      body: { name, email, password, confirmPassword, acceptTerms },
    });
  }, []);

  const logout = useCallback(async () => {
    const token = accessToken;
    setSession(null);
    if (!token) return;
    try {
      await apiRequest('/logout', { method: 'GET', token });
    } catch {
      // best-effort; token might already be invalid/expired
    }
  }, [accessToken, setSession]);

  const forgotPassword = useCallback(async ({ email }) => {
    return apiRequest('/forget_password', {
      method: 'PUT',
      body: { email },
    });
  }, []);

  const value = useMemo(() => {
    const authenticated = Boolean(accessToken) && !isExpired(expiry);
    return {
      isReady,
      authenticated,
      accessToken,
      expiry,
      user,
      login,
      register,
      logout,
      forgotPassword,
      setSession,
    };
  }, [accessToken, expiry, isReady, login, logout, register, forgotPassword, setSession, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

