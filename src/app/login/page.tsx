'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-foreground">Log In</h1>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        New? You&apos;ll be signed up automatically. Returning? Welcome back!
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
            required
            minLength={2}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neon-cyan py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Entering...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
