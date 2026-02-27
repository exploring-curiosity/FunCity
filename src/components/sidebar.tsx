'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame } from 'lucide-react';
import type { Subreddit, PostWithDetails } from '@/lib/types';

export function Sidebar() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [trending, setTrending] = useState<PostWithDetails[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/subreddits')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSubreddits(data);
      })
      .catch(() => {});

    fetch('/api/trending')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTrending(data);
      })
      .catch(() => {});
  }, []);

  const boroughs = subreddits.filter((s) => s.type === 'borough');
  const categories = subreddits.filter((s) => s.type === 'category');

  return (
    <aside className="hidden w-64 shrink-0 space-y-4 lg:block">
      {/* Subreddits */}
      <div className="rounded-lg border border-border bg-card p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Boroughs
        </h3>
        <div className="space-y-0.5">
          {boroughs.map((sub) => (
            <Link
              key={sub.id}
              href={`/r/${sub.name}`}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                pathname === `/r/${sub.name}`
                  ? 'bg-secondary text-neon-cyan'
                  : 'text-foreground hover:bg-secondary/50'
              }`}
            >
              <span>{sub.emoji}</span>
              <span>{sub.display_name}</span>
            </Link>
          ))}
        </div>

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Topics
        </h3>
        <div className="space-y-0.5">
          {categories.map((sub) => (
            <Link
              key={sub.id}
              href={`/r/${sub.name}`}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                pathname === `/r/${sub.name}`
                  ? 'bg-secondary text-neon-cyan'
                  : 'text-foreground hover:bg-secondary/50'
              }`}
            >
              <span>{sub.emoji}</span>
              <span>{sub.display_name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-neon-pink" />
            Trending
          </h3>
          <div className="space-y-2">
            {trending.map((post, i) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group block"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-neon-cyan">
                      {post.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {post.vote_count} votes · r/{post.subreddit_name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
