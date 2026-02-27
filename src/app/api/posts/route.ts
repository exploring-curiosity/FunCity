import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';
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
  user_id: string;
}

interface CommentCountRow {
  post_id: string;
}

interface UserRow {
  id: string;
  username: string;
}

interface SubredditRow {
  id: string;
  name: string;
  display_name: string;
  color: string;
  emoji: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subredditId = searchParams.get('subreddit_id');
    const sort = searchParams.get('sort') || 'hot';
    const userId = searchParams.get('user_id');
    const auth = getAuthFromRequest(request);

    const supabase = getSupabase();

    let query = supabase.from('posts').select('*');
    if (subredditId) {
      query = query.eq('subreddit_id', subredditId);
    }
    query = query.order('created_at', { ascending: false }).limit(50);

    const { data: posts, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!posts || posts.length === 0) return NextResponse.json([]);

    const postIds = (posts as PostRow[]).map((p) => p.id);
    const authorIds = Array.from(new Set((posts as PostRow[]).map((p) => p.author_id)));
    const subredditIds = Array.from(new Set((posts as PostRow[]).map((p) => p.subreddit_id)));

    const [votesRes, commentsRes, usersRes, subredditsRes] = await Promise.all([
      supabase.from('votes').select('post_id, value, user_id').in('post_id', postIds),
      supabase.from('comments').select('post_id').in('post_id', postIds),
      supabase.from('users').select('id, username').in('id', authorIds),
      supabase.from('subreddits').select('id, name, display_name, color, emoji').in('id', subredditIds),
    ]);

    const votes = (votesRes.data || []) as VoteRow[];
    const comments = (commentsRes.data || []) as CommentCountRow[];
    const users = (usersRes.data || []) as UserRow[];
    const subreddits = (subredditsRes.data || []) as SubredditRow[];

    const userMap = new Map(users.map((u) => [u.id, u.username]));
    const subMap = new Map(subreddits.map((s) => [s.id, s]));

    const enriched = (posts as PostRow[]).map((post) => {
      const postVotes = votes.filter((v) => v.post_id === post.id);
      const upvotes = postVotes.filter((v) => v.value === 1).length;
      const downvotes = postVotes.filter((v) => v.value === -1).length;
      const commentCount = comments.filter((c) => c.post_id === post.id).length;
      const sub = subMap.get(post.subreddit_id);
      const userVote = auth
        ? postVotes.find((v) => v.user_id === auth.user_id)?.value ?? null
        : null;

      return {
        ...post,
        author_username: userMap.get(post.author_id) || 'unknown',
        subreddit_name: sub?.name || '',
        subreddit_display_name: sub?.display_name || '',
        subreddit_color: sub?.color || '#00f0ff',
        subreddit_emoji: sub?.emoji || '📌',
        vote_count: upvotes - downvotes,
        comment_count: commentCount,
        user_vote: userVote,
        _hot_score: hotScore(upvotes, downvotes, post.created_at),
        _top_score: upvotes - downvotes,
      };
    });

    if (sort === 'hot') {
      enriched.sort((a, b) => b._hot_score - a._hot_score);
    } else if (sort === 'top') {
      enriched.sort((a, b) => b._top_score - a._top_score);
    }
    // 'new' is already sorted by created_at desc

    if (userId) {
      const filtered = enriched.filter((p) => p.author_id === userId);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: postBody, image_url, subreddit_id } = body;

    if (!title || !subreddit_id) {
      return NextResponse.json({ error: 'Title and subreddit are required' }, { status: 400 });
    }

    if (title.length > 300) {
      return NextResponse.json({ error: 'Title must be 300 characters or less' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        body: postBody || null,
        image_url: image_url || null,
        subreddit_id,
        author_id: auth.user_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
