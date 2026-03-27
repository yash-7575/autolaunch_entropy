import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(svg|png|jpg|jpeg|ico|mp4|webp|gif)$/)
  ) {
    return NextResponse.next();
  }

  const authToken =
    request.cookies.get('auth-token')?.value ||
    // NextAuth v5 (authjs) cookie names
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    // NextAuth v4 legacy cookie names (fallback)
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  const isAuthenticated = !!authToken;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/launches', request.url));
  }

  // Protect all non-public routes
  if (!isPublicRoute && !isAuthenticated) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
