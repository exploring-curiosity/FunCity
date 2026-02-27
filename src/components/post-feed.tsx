'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from './post-card';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import type { PostWithDetails, SortMode } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/lib/analytics';

interface PostFeedProps {
  subredditId?: string;
  subredditName?: string;
  hideSubreddit?: boolean;
}

export function PostFeed({ subredditId, subredditName, hideSubreddit = false }: PostFeedProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [sort, setSort] = useState<SortMode>('hot');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (subredditId) params.set('subreddit_id', subredditId);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/posts?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [sort, subredditId, token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSortChange = (newSort: SortMode) => {
    setSort(newSort);
    track('sort_changed', { sort_mode: newSort, subreddit: subredditName || 'home' });
  };

  const sortButtons: { value: SortMode; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame className="h-4 w-4" /> },
    { value: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
    { value: 'top', label: 'Top', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-2">
        {sortButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => handleSortChange(btn.value)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === btn.value
                ? 'bg-secondary text-neon-cyan'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No posts yet. Be the first to share something!
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} hideSubreddit={hideSubreddit} />
        ))
      )}
    </div>
  );
}
