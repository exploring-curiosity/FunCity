import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, age_group, country, nyc_familiarity, created_at')
      .eq('username', params.username.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get karma (sum of all vote values on user's posts + comments)
    const [postVotesRes, commentVotesRes] = await Promise.all([
      supabase.rpc('get_user_post_karma', { uid: user.id }).single(),
      supabase.rpc('get_user_comment_karma', { uid: user.id }).single(),
    ]);

    // Fallback: calculate karma manually if RPCs don't exist
    let postKarma = 0;
    let commentKarma = 0;

    if (postVotesRes.error || commentVotesRes.error) {
      // Manual calculation
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('author_id', user.id);

      if (userPosts && userPosts.length > 0) {
        const postIds = (userPosts as { id: string }[]).map((p) => p.id);
        const { data: pVotes } = await supabase
          .from('votes')
          .select('value')
          .in('post_id', postIds);
        postKarma = (pVotes || []).reduce((sum: number, v: { value: number }) => sum + v.value, 0);
      }

      const { data: userComments } = await supabase
        .from('comments')
        .select('id')
        .eq('author_id', user.id);

      if (userComments && userComments.length > 0) {
        const commentIds = (userComments as { id: string }[]).map((c) => c.id);
        const { data: cVotes } = await supabase
          .from('votes')
          .select('value')
          .in('comment_id', commentIds);
        commentKarma = (cVotes || []).reduce((sum: number, v: { value: number }) => sum + v.value, 0);
      }
    } else {
      postKarma = (postVotesRes.data as { karma: number } | null)?.karma || 0;
      commentKarma = (commentVotesRes.data as { karma: number } | null)?.karma || 0;
    }

    return NextResponse.json({
      ...user,
      post_karma: postKarma,
      comment_karma: commentKarma,
      total_karma: postKarma + commentKarma,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
