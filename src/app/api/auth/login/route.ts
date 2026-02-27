import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = createToken(user.id, user.username);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _hash, ...safeUser } = user;

    return NextResponse.json({ user: safeUser, token });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
