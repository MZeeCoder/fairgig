import { NextResponse } from 'next/server';

export default function proxy(request) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedPage = pathname.startsWith('/worker') || pathname.startsWith('/verifier') || pathname.startsWith('/advocate');

  // If user is not logged in (no refresh token) and tries to access a protected page, redirect to login
  if (!refreshToken && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in, handle redirects and role-based access
  if (refreshToken) {
    // If logged-in user tries to access login/register, redirect to their dashboard
    if (isAuthPage) {
      if (userRole === 'worker') {
        return NextResponse.redirect(new URL('/worker', request.url));
      } else if (userRole === 'verifier') {
        return NextResponse.redirect(new URL('/verifier', request.url));
      } else if (userRole === 'advocate') {
        return NextResponse.redirect(new URL('/advocate', request.url));
      }
      // If none of the roles match, avoid redirecting to /login to prevent an infinite redirect loop.
    }

    // Role-Based Access Control (RBAC)
    if (pathname.startsWith('/worker') && userRole !== 'worker') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/verifier') && userRole !== 'verifier') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/advocate') && userRole !== 'advocate') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
