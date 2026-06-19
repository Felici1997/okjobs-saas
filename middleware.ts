import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const publicRoutes = ['/', '/login', '/register', '/reset-password'];
const authRoutes = ['/login', '/register'];
const apiPublicRoutes = ['/api/v1'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API publique : laisser passer (auth gérée dans les routes)
  if (apiPublicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Cron endpoint : auth via CRON_SECRET dans la route
  if (pathname.startsWith('/api/internal/cron')) {
    return NextResponse.next();
  }

  // Affiliate endpoints : auth côté route (key ou session)
  if (pathname.startsWith('/api/affiliate') || pathname.startsWith('/api/whatsapp')) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  // Pages auth (login/register) : rediriger vers dashboard si déjà connecté
  if (authRoutes.some((route) => pathname === route) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Routes protégées (dashboard, cv, interview, history)
  if (!publicRoutes.some((route) => pathname === route) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
