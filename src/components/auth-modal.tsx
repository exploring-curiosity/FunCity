'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { AGE_GROUPS, NYC_FAMILIARITY_OPTIONS } from '@/lib/types';
import { countries } from '@/data/countries';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const { login, signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [country, setCountry] = useState('');
  const [nycFamiliarity, setNycFamiliarity] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginUsername, loginPassword);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!ageGroup || !country || !nycFamiliarity) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await signup({
        username: signupUsername,
        password: signupPassword,
        age_group: ageGroup,
        country,
        nyc_familiarity: nycFamiliarity,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex gap-4 border-b border-border">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'login' ? 'border-b-2 border-neon-cyan text-neon-cyan' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); }}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'signup' ? 'border-b-2 border-neon-cyan text-neon-cyan' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-neon-cyan py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Username</label>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Password</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Age Group</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                required
              >
                <option value="">Select age group</option>
                {AGE_GROUPS.map((ag) => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                required
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">NYC Familiarity</label>
              <select
                value={nycFamiliarity}
                onChange={(e) => setNycFamiliarity(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                required
              >
                <option value="">Select familiarity</option>
                {NYC_FAMILIARITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-neon-cyan py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
