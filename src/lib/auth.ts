import bcrypt from 'bcryptjs';
import type { AuthToken } from './types';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function getSecret(): string {
  return process.env.AUTH_SECRET || 'fallback_dev_secret';
}

export function createToken(userId: string, username: string): string {
  const payload: AuthToken = {
    user_id: userId,
    username,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json).toString('base64');
  const signature = Buffer.from(
    `${base64}.${getSecret()}`
  ).toString('base64');
  return `${base64}.${signature}`;
}

export function verifyToken(token: string): AuthToken | null {
  try {
    const [base64, signature] = token.split('.');
    if (!base64 || !signature) return null;

    const expectedSig = Buffer.from(
      `${base64}.${getSecret()}`
    ).toString('base64');
    if (signature !== expectedSig) return null;

    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const payload: AuthToken = JSON.parse(json);

    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export function getAuthFromRequest(request: Request): AuthToken | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}
