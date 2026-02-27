import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';

interface CommentRow {
  id: string;
  post_id: string;
  parent_id: string | null;
  content: string;
  author_id: string;
  created_at: string;
}

interface VoteRow {
  comment_id: string;
  value: number;
  user_id: string;
}

interface UserRow {
  id: string;
  username: string;
}

interface CommentWithDetails extends CommentRow {
  author_username: string;
  vote_count: number;
  user_vote: number | null;
  replies: CommentWithDetails[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request);
    const supabase = getSupabase();

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', params.id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!comments || comments.length === 0) return NextResponse.json([]);

    const typedComments = comments as CommentRow[];
    const commentIds = typedComments.map((c) => c.id);
    const authorIds = Array.from(new Set(typedComments.map((c) => c.author_id)));

    const [votesRes, usersRes] = await Promise.all([
      supabase.from('votes').select('comment_id, value, user_id').in('comment_id', commentIds),
      supabase.from('users').select('id, username').in('id', authorIds),
    ]);

    const votes = (votesRes.data || []) as VoteRow[];
    const users = (usersRes.data || []) as UserRow[];
    const userMap = new Map(users.map((u) => [u.id, u.username]));

    const enriched: CommentWithDetails[] = typedComments.map((c) => {
      const cVotes = votes.filter((v) => v.comment_id === c.id);
      const up = cVotes.filter((v) => v.value === 1).length;
      const down = cVotes.filter((v) => v.value === -1).length;
      const userVote = auth ? cVotes.find((v) => v.user_id === auth.user_id)?.value ?? null : null;

      return {
        ...c,
        author_username: userMap.get(c.author_id) || 'unknown',
        vote_count: up - down,
        user_vote: userVote,
        replies: [],
      };
    });

    // Build tree
    const map = new Map(enriched.map((c) => [c.id, c]));
    const roots: CommentWithDetails[] = [];

    for (const c of enriched) {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.replies.push(c);
      } else {
        roots.push(c);
      }
    }

    return NextResponse.json(roots);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
