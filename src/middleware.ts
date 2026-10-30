import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  // Public pages have no server actions (forms post to /api/*). Bots that POST fake server-action
  // requests to "/" or old WordPress paths otherwise make Next.js answer 500 → reported as a server error.
  if (!isAdmin && !pathname.startsWith('/api/') && req.method !== 'GET' && req.method !== 'HEAD') {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
  }
  if (!isAdmin) return NextResponse.next();

  // Cheap first gate for /admin. Every admin page and action also calls requireAdmin() server-side.
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

// everything except Next.js build assets and media files
export const config = { matcher: ['/((?!_next/static|_next/image|media/).*)'] };
