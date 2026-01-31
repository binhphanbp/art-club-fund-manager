import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Define route types
const publicRoutes = ['/', '/login'];
const protectedRoutes = ['/dashboard'];
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update Supabase session and get user
  const { supabase, supabaseResponse, user } = await updateSession(request);

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Check if route is admin-only
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Allow public routes
  if (isPublicRoute) {
    // If user is logged in and tries to access login, redirect to dashboard
    if (pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse;
  }

  // If no user and trying to access protected/admin routes, redirect to login
  if (!user && (isProtectedRoute || isAdminRoute)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user exists and trying to access admin routes, check role from user metadata
  if (user && isAdminRoute) {
    // Get role from user metadata (set during signup/by admin)
    const userRole = user.user_metadata?.role || 'MEMBER';

    // If user is not ADMIN or SUPER_ADMIN, redirect to dashboard
    if (userRole === 'MEMBER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
