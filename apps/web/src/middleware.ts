import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refresh_token')?.value;

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  
  if (isAuthRoute) {
    if (token) {
      // Redirect to dashboard if already logged in
      return NextResponse.redirect(new URL('/chat', request.url));
    }
    return NextResponse.next();
  }

  // Protect /chat and other internal routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/auth/:path*'],
};
