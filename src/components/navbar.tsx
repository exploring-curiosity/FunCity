'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { UserMenu } from './user-menu';
import { AuthModal } from './auth-modal';

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-neon-cyan">🗽 FunCity</span>
          </Link>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-secondary" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/submit"
                  className="flex items-center gap-1.5 rounded-md border border-neon-cyan px-3 py-1.5 text-sm font-medium text-neon-cyan transition-colors hover:bg-neon-cyan/10"
                >
                  <Plus className="h-4 w-4" />
                  New Post
                </Link>
                <UserMenu />
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthModal('login')}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Log In
                </button>
                <button
                  onClick={() => setAuthModal('signup')}
                  className="rounded-md bg-neon-cyan px-3 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        initialTab={authModal || 'login'}
      />
    </>
  );
}
