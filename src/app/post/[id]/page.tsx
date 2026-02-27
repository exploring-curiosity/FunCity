'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { VoteButtons } from '@/components/vote-buttons';
import { SubredditBadge } from '@/components/subreddit-badge';
import { CommentTree } from '@/components/comment-tree';
import { CommentForm } from '@/components/comment-form';
import { Sidebar } from '@/components/sidebar';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/lib/analytics';
import type { PostWithDetails, CommentWithDetails } from '@/lib/types';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/posts/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        track('post_viewed', { post_id: id, subreddit: data.subreddit_name });
      }
    } catch {
      // ignore
    }
  }, [id, token]);

  const fetchComments = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/posts/${id}/comments`, { headers });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // ignore
    }
  }, [id, token]);

  useEffect(() => {
    Promise.all([fetchPost(), fetchComments()]).finally(() => setLoading(false));
  }, [fetchPost, fetchComments]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
        <Link href="/" className="mt-4 inline-block text-neon-cyan hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <div className="min-w-0 flex-1 space-y-4">
        {/* Post */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex gap-3">
            <VoteButtons
              postId={post.id}
              initialCount={post.vote_count}
              initialUserVote={post.user_vote}
              orientation="vertical"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <SubredditBadge
                  name={post.subreddit_name}
                  displayName={post.subreddit_display_name}
                  color={post.subreddit_color}
                  emoji={post.subreddit_emoji}
                />
                <span>
                  Posted by{' '}
                  <Link href={`/user/${post.author_username}`} className="font-medium text-foreground hover:text-neon-cyan">
                    u/{post.author_username}
                  </Link>
                </span>
                <span>{timeAgo(post.created_at)}</span>
              </div>
              <h1 className="mb-3 text-xl font-bold text-foreground">{post.title}</h1>
              {post.body && (
                <div className="mb-3 whitespace-pre-wrap text-sm text-foreground/90">{post.body}</div>
              )}
              {post.image_url && (
                <div className="mb-3 overflow-hidden rounded-md">
                  <img src={post.image_url} alt="" className="max-h-96 w-full object-cover" loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comment form */}
        <div className="rounded-lg border border-border bg-card p-4">
          <CommentForm postId={post.id} onSubmitted={fetchComments} />
        </div>

        {/* Comments */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
            {post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}
          </h2>
          <CommentTree comments={comments} postId={post.id} onRefresh={fetchComments} />
        </div>
      </div>
      <Sidebar />
    </div>
  );
}
