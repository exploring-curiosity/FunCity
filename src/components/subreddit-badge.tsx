'use client';

import Link from 'next/link';

interface SubredditBadgeProps {
  name: string;
  displayName: string;
  color: string;
  emoji: string;
  size?: 'sm' | 'md';
}

export function SubredditBadge({ name, displayName, color, emoji, size = 'sm' }: SubredditBadgeProps) {
  return (
    <Link
      href={`/r/${name}`}
      className={`inline-flex items-center gap-1 rounded-full border font-medium transition-colors hover:opacity-80 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      style={{ borderColor: color, color }}
    >
      <span>{emoji}</span>
      <span>r/{displayName}</span>
    </Link>
  );
}
