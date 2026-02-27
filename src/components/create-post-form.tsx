'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/lib/analytics';
import type { Subreddit } from '@/lib/types';

interface CreatePostFormProps {
  preselectedSubredditId?: string;
}

export function CreatePostForm({ preselectedSubredditId }: CreatePostFormProps) {
  const router = useRouter();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [subredditId, setSubredditId] = useState(preselectedSubredditId || '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/subreddits')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSubreddits(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedSubredditId) {
      setSubredditId(preselectedSubredditId);
    }
  }, [preselectedSubredditId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subredditId || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim() || null,
          image_url: imageUrl.trim() || null,
          subreddit_id: subredditId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create post');
        return;
      }

      const post = await res.json();
      const sub = subreddits.find((s) => s.id === subredditId);
      track('post_created', { post_id: post.id, subreddit: sub?.name, title: title.trim() });
      router.push(`/post/${post.id}`);
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">You must be logged in to create a post.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Create a Post</h2>

      {error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm text-muted-foreground">Community</label>
        <select
          value={subredditId}
          onChange={(e) => setSubredditId(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
          required
        >
          <option value="">Choose a community</option>
          {subreddits.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.emoji} r/{sub.display_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted-foreground">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="An interesting title"
          maxLength={300}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
          required
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{title.length}/300</p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted-foreground">Body (optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us more..."
          rows={6}
          className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted-foreground">Image URL (optional)</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
        />
      </div>

      <button
        type="submit"
        disabled={!title.trim() || !subredditId || submitting}
        className="rounded-md bg-neon-cyan px-6 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
