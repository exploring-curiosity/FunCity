'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { identifyUser, resetIdentity, track } from '@/lib/analytics';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('funCity_user');
      const storedToken = localStorage.getItem('funCity_token');
      if (stored && storedToken) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
        setToken(storedToken);
        identifyUser(parsed.id, parsed.username, {
          age_group: parsed.age_group,
          country: parsed.country,
          nyc_familiarity: parsed.nyc_familiarity,
        });
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('funCity_user', JSON.stringify(data.user));
    localStorage.setItem('funCity_token', data.token);
    identifyUser(data.user.id, data.user.username, {
      age_group: data.user.age_group,
      country: data.user.country,
      nyc_familiarity: data.user.nyc_familiarity,
    });
    track(data.is_new ? 'user_signed_up' : 'user_logged_in', { username: data.user.username });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('funCity_user');
    localStorage.removeItem('funCity_token');
    resetIdentity();
    track('user_logged_out');
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, getAuthHeaders }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
