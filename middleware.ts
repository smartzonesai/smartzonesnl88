import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.headers.set('x-next-pathname', pathname);

  // ── Admin: HTTP Basic Auth via ADMIN_PASSWORD ───────────────
  if (pathname.startsWith('/admin')) {
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Fail closed: if ADMIN_PASSWORD is not configured, always deny.
    // This prevents accidental exposure in production.
    if (!adminPassword) {
      return new NextResponse('Admin niet geconfigureerd. Stel ADMIN_PASSWORD in.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const authHeader = request.headers.get('authorization') || '';
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme !== 'Basic' || !encoded) {
      return new NextResponse('Toegang geweigerd', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="SmartZones Admin"' },
      });
    }
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [, password] = decoded.split(':');
    if (password !== adminPassword) {
      return new NextResponse('Ongeldig wachtwoord', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="SmartZones Admin"' },
      });
    }
    return response;
  }

  // ── Dashboard: Supabase session check ─────────────────────────
  if (pathname.startsWith('/dashboard')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt)$).*)'],
};
