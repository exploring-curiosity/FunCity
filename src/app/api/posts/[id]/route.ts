import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request);
    const supabase = getSupabase();

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const [authorRes, subRes, votesRes, commentsRes] = await Promise.all([
      supabase.from('users').select('username').eq('id', post.author_id).single(),
      supabase.from('subreddits').select('name, display_name, color, emoji').eq('id', post.subreddit_id).single(),
      supabase.from('votes').select('value, user_id').eq('post_id', post.id),
      supabase.from('comments').select('id').eq('post_id', post.id),
    ]);

    const votes = (votesRes.data || []) as { value: number; user_id: string }[];
    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;
    const userVote = auth ? votes.find((v) => v.user_id === auth.user_id)?.value ?? null : null;

    return NextResponse.json({
      ...post,
      author_username: authorRes.data?.username || 'unknown',
      subreddit_name: subRes.data?.name || '',
      subreddit_display_name: subRes.data?.display_name || '',
      subreddit_color: subRes.data?.color || '#00f0ff',
      subreddit_emoji: subRes.data?.emoji || '📌',
      vote_count: upvotes - downvotes,
      comment_count: commentsRes.data?.length || 0,
      user_vote: userVote,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
