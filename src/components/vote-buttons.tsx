'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { track } from '@/lib/analytics';

interface VoteButtonsProps {
  postId?: string;
  commentId?: string;
  initialCount: number;
  initialUserVote: number | null;
  orientation?: 'vertical' | 'horizontal';
}

export function VoteButtons({
  postId,
  commentId,
  initialCount,
  initialUserVote,
  orientation = 'vertical',
}: VoteButtonsProps) {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (!isAuthenticated || isVoting) return;
    setIsVoting(true);

    const prevCount = count;
    const prevVote = userVote;

    // Optimistic update
    if (userVote === value) {
      setCount(count - value);
      setUserVote(null);
    } else {
      setCount(count - (userVote || 0) + value);
      setUserVote(value);
    }

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ post_id: postId, comment_id: commentId, value }),
      });

      if (!res.ok) {
        setCount(prevCount);
        setUserVote(prevVote);
      } else {
        track(postId ? 'post_voted' : 'comment_voted', {
          [postId ? 'post_id' : 'comment_id']: postId || commentId,
          value,
        });
      }
    } catch {
      setCount(prevCount);
      setUserVote(prevVote);
    } finally {
      setIsVoting(false);
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className={`flex items-center gap-0.5 ${isVertical ? 'flex-col' : 'flex-row'}`}>
      <button
        onClick={() => handleVote(1)}
        disabled={!isAuthenticated || isVoting}
        className={`rounded p-1 transition-colors hover:bg-secondary ${
          userVote === 1 ? 'text-neon-cyan' : 'text-muted-foreground'
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label="Upvote"
      >
        <ChevronUp className={isVertical ? 'h-5 w-5' : 'h-4 w-4'} />
      </button>
      <span
        className={`font-bold tabular-nums ${
          userVote === 1 ? 'text-neon-cyan' : userVote === -1 ? 'text-neon-pink' : 'text-foreground'
        } ${isVertical ? 'text-sm' : 'text-xs'}`}
      >
        {count}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={!isAuthenticated || isVoting}
        className={`rounded p-1 transition-colors hover:bg-secondary ${
          userVote === -1 ? 'text-neon-pink' : 'text-muted-foreground'
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label="Downvote"
      >
        <ChevronDown className={isVertical ? 'h-5 w-5' : 'h-4 w-4'} />
      </button>
    </div>
  );
}
