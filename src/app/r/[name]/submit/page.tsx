'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CreatePostForm } from '@/components/create-post-form';
import type { Subreddit } from '@/lib/types';

export default function SubredditSubmitPage() {
  const params = useParams();
  const name = params.name as string;
  const [subredditId, setSubredditId] = useState<string>('');

  useEffect(() => {
    fetch(`/api/subreddits/${name}`)
      .then((r) => r.json())
      .then((data: Subreddit) => {
        if (data.id) setSubredditId(data.id);
      })
      .catch(() => {});
  }, [name]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <CreatePostForm preselectedSubredditId={subredditId} />
    </div>
  );
}
