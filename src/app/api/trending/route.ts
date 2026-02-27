import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { hotScore } from '@/lib/hot-score';

interface PostRow {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  subreddit_id: string;
  author_id: string;
  created_at: string;
}

interface VoteRow {
  post_id: string;
  value: number;
}

interface SubredditRow {
  id: string;
  name: string;
  display_name: string;
  color: string;
  emoji: string;
}

interface UserRow {
  id: string;
  username: string;
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!posts || posts.length === 0) return NextResponse.json([]);

    const typedPosts = posts as PostRow[];
    const postIds = typedPosts.map((p) => p.id);
    const authorIds = Array.from(new Set(typedPosts.map((p) => p.author_id)));
    const subredditIds = Array.from(new Set(typedPosts.map((p) => p.subreddit_id)));

    const [votesRes, usersRes, subsRes, commentsRes] = await Promise.all([
      supabase.from('votes').select('post_id, value').in('post_id', postIds),
      supabase.from('users').select('id, username').in('id', authorIds),
      supabase.from('subreddits').select('id, name, display_name, color, emoji').in('id', subredditIds),
      supabase.from('comments').select('post_id').in('post_id', postIds),
    ]);

    const votes = (votesRes.data || []) as VoteRow[];
    const users = (usersRes.data || []) as UserRow[];
    const subs = (subsRes.data || []) as SubredditRow[];
    const comments = (commentsRes.data || []) as { post_id: string }[];

    const userMap = new Map(users.map((u) => [u.id, u.username]));
    const subMap = new Map(subs.map((s) => [s.id, s]));

    const scored = typedPosts.map((post) => {
      const pVotes = votes.filter((v) => v.post_id === post.id);
      const up = pVotes.filter((v) => v.value === 1).length;
      const down = pVotes.filter((v) => v.value === -1).length;
      const sub = subMap.get(post.subreddit_id);
      const commentCount = comments.filter((c) => c.post_id === post.id).length;

      return {
        ...post,
        author_username: userMap.get(post.author_id) || 'unknown',
        subreddit_name: sub?.name || '',
        subreddit_display_name: sub?.display_name || '',
        subreddit_color: sub?.color || '#00f0ff',
        subreddit_emoji: sub?.emoji || '📌',
        vote_count: up - down,
        comment_count: commentCount,
        user_vote: null,
        _score: hotScore(up, down, post.created_at),
      };
    });

    scored.sort((a, b) => b._score - a._score);

    return NextResponse.json(scored.slice(0, 5));
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
