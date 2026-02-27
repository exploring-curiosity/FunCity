'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { VoteButtons } from './vote-buttons';
import { CommentForm } from './comment-form';
import type { CommentWithDetails } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';

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

interface CommentNodeProps {
  comment: CommentWithDetails;
  postId: string;
  depth: number;
  onRefresh: () => void;
}

function CommentNode({ comment, postId, depth, onRefresh }: CommentNodeProps) {
  const [showReply, setShowReply] = useState(false);
  const { isAuthenticated } = useAuth();
  const maxDepth = 6;

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-border pl-4' : ''}`}>
      <div className="py-2">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href={`/user/${comment.author_username}`} className="font-medium text-foreground hover:text-neon-cyan">
            u/{comment.author_username}
          </Link>
          <span>{timeAgo(comment.created_at)}</span>
        </div>
        <p className="mb-2 text-sm text-foreground">{comment.content}</p>
        <div className="flex items-center gap-2">
          <VoteButtons
            commentId={comment.id}
            initialCount={comment.vote_count}
            initialUserVote={comment.user_vote}
            orientation="horizontal"
          />
          {isAuthenticated && depth < maxDepth && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <MessageSquare className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
        {showReply && (
          <div className="mt-2">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSubmitted={() => {
                setShowReply(false);
                onRefresh();
              }}
              onCancel={() => setShowReply(false)}
              placeholder="Write a reply..."
            />
          </div>
        )}
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentTreeProps {
  comments: CommentWithDetails[];
  postId: string;
  onRefresh: () => void;
}

export function CommentTree({ comments, postId, onRefresh }: CommentTreeProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No comments yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {comments.map((comment) => (
        <CommentNode key={comment.id} comment={comment} postId={postId} depth={0} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
