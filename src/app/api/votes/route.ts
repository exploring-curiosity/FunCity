import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id, comment_id, value } = body;

    if ((!post_id && !comment_id) || (post_id && comment_id)) {
      return NextResponse.json({ error: 'Provide either post_id or comment_id' }, { status: 400 });
    }

    if (value !== 1 && value !== -1) {
      return NextResponse.json({ error: 'Value must be 1 or -1' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check for existing vote
    let existingQuery = supabase
      .from('votes')
      .select('id, value')
      .eq('user_id', auth.user_id);

    if (post_id) {
      existingQuery = existingQuery.eq('post_id', post_id);
    } else {
      existingQuery = existingQuery.eq('comment_id', comment_id);
    }

    const { data: existing } = await existingQuery.single();

    if (existing) {
      if (existing.value === value) {
        // Same vote — toggle off (remove)
        await supabase.from('votes').delete().eq('id', existing.id);
        return NextResponse.json({ removed: true, value });
      } else {
        // Different vote — update
        const { data, error } = await supabase
          .from('votes')
          .update({ value })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
      }
    }

    // New vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        user_id: auth.user_id,
        post_id: post_id || null,
        comment_id: comment_id || null,
        value,
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
