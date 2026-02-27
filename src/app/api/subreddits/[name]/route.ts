import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('subreddits')
      .select('*')
      .eq('name', params.name)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Subreddit not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
