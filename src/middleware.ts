import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Cheap first gate for /admin. Every admin page and action also calls requireAdmin() server-side.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();
  const token = req.cookies.get('edexo_admin')?.value;
  const secret = process.env.SESSION_SECRET;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch { /* fall through */ }
  }
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
