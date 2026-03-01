import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const normalized = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (normalized.length < 2 || normalized.length > 20) {
      return NextResponse.json({ error: 'Username must be 2-20 characters (letters, numbers, underscores)' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, username, age_group, country, nyc_familiarity, created_at')
      .eq('username', normalized)
      .single();

    if (existing) {
      // Existing user — log them in
      const token = createToken(existing.id, existing.username);
      return NextResponse.json({ user: existing, token, is_new: false });
    }

    // New user — create account with default demographics
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: normalized,
        password_hash: 'none',
        age_group: '25-34',
        country: 'United States',
        nyc_familiarity: 'visited',
      })
      .select('id, username, age_group, country, nyc_familiarity, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const token = createToken(newUser.id, newUser.username);
    return NextResponse.json({ user: newUser, token, is_new: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
