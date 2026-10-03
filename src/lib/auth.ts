import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';

export const SESSION_COOKIE = 'edexo_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function secretKey() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 24) throw new Error('SESSION_SECRET must be set (at least 24 characters)');
  return new TextEncoder().encode(s);
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const uid = Number(payload.uid);
    const [u] = await db.select({ id: schema.adminUsers.id, email: schema.adminUsers.email, name: schema.adminUsers.name })
      .from(schema.adminUsers).where(eq(schema.adminUsers.id, uid)).limit(1);
    return u ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const u = await getAdmin();
  if (!u) redirect('/admin/login');
  return u;
}
