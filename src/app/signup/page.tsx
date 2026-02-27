'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { AGE_GROUPS, NYC_FAMILIARITY_OPTIONS } from '@/lib/types';
import { countries } from '@/data/countries';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [country, setCountry] = useState('');
  const [nycFamiliarity, setNycFamiliarity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!ageGroup || !country || !nycFamiliarity) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await signup({ username, password, age_group: ageGroup, country, nyc_familiarity: nycFamiliarity });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-foreground">Sign Up</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-neon-cyan hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
