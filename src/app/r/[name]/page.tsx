'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { PostFeed } from '@/components/post-feed';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/lib/analytics';
import type { Subreddit } from '@/lib/types';

export default function SubredditPage() {
  const params = useParams();
  const name = params.name as string;
  const { isAuthenticated } = useAuth();
  const [subreddit, setSubreddit] = useState<Subreddit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/subreddits/${name}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setSubreddit(data);
        track('subreddit_viewed', { subreddit: name });
      })
      .catch(() => setSubreddit(null))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <div className="h-32 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (!subreddit) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Community not found</h1>
        <p className="mt-2 text-muted-foreground">r/{name} doesn&apos;t exist.</p>
        <Link href="/" className="mt-4 inline-block text-neon-cyan hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <div className="min-w-0 flex-1 space-y-4">
        {/* Subreddit header */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{subreddit.emoji}</span>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  r/{subreddit.display_name}
                </h1>
                {subreddit.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{subreddit.description}</p>
                )}
              </div>
            </div>
            {isAuthenticated && (
              <Link
                href={`/r/${name}/submit`}
                className="flex items-center gap-1.5 rounded-md border border-neon-cyan px-3 py-1.5 text-sm font-medium text-neon-cyan transition-colors hover:bg-neon-cyan/10"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Link>
            )}
          </div>
        </div>

        <PostFeed subredditId={subreddit.id} subredditName={subreddit.name} hideSubreddit />
      </div>
      <Sidebar />
    </div>
  );
}
