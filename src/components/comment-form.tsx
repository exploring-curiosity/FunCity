'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/lib/analytics';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({ postId, parentId, onSubmitted, onCancel, placeholder = 'What are your thoughts?' }: CommentFormProps) {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ post_id: postId, parent_id: parentId || null, content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to post comment');
        return;
      }

      const comment = await res.json();
      track('comment_created', { post_id: postId, comment_id: comment.id, is_reply: !!parentId });
      setContent('');
      onSubmitted?.();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
        Log in to comment
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
        rows={3}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="rounded-md bg-neon-cyan px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
