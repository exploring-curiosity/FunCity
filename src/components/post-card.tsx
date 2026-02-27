'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { VoteButtons } from './vote-buttons';
import { SubredditBadge } from './subreddit-badge';
import type { PostWithDetails } from '@/lib/types';

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

interface PostCardProps {
  post: PostWithDetails;
  hideSubreddit?: boolean;
}

export function PostCard({ post, hideSubreddit = false }: PostCardProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-muted-foreground/30">
      <VoteButtons
        postId={post.id}
        initialCount={post.vote_count}
        initialUserVote={post.user_vote}
        orientation="vertical"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {!hideSubreddit && (
            <SubredditBadge
              name={post.subreddit_name}
              displayName={post.subreddit_display_name}
              color={post.subreddit_color}
              emoji={post.subreddit_emoji}
            />
          )}
          <span>
            by{' '}
            <Link href={`/user/${post.author_username}`} className="font-medium text-foreground hover:text-neon-cyan">
              u/{post.author_username}
            </Link>
          </span>
          <span>{timeAgo(post.created_at)}</span>
        </div>
        <Link href={`/post/${post.id}`} className="group">
          <h3 className="mb-1 text-base font-semibold leading-snug text-foreground group-hover:text-neon-cyan">
            {post.title}
          </h3>
          {post.body && (
            <p className="mb-2 line-clamp-3 text-sm text-muted-foreground">
              {post.body}
            </p>
          )}
        </Link>
        {post.image_url && (
          <div className="mb-2 overflow-hidden rounded-md">
            <img
              src={post.image_url}
              alt=""
              className="max-h-64 w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
