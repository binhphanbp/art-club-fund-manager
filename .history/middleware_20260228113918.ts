import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Define route types
const publicRoutes = ['/', '/login'];
const protectedRoutes = ['/dashboard'];
const adminRoutes = ['/admin'];
const superAdminRoutes = ['/super-admin'];
// Accessible when logged in but PENDING/REJECTED
const pendingRoutes = ['/pending-approval'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update Supabase session and get user
  const { supabase, supabaseResponse, user } = await updateSession(request);

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isSuperAdminRoute = superAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isPendingRoute = pendingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // /pending-approval: must be logged in; if ACTIVE redirect to dashboard
  if (isPendingRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const userStatus = user.user_metadata?.status || 'PENDING';
    if (userStatus === 'ACTIVE') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse;
  }

  // Public routes
  if (isPublicRoute) {
    if (pathname === '/login' && user) {
      const userStatus = user.user_metadata?.status || 'PENDING';
      if (userStatus === 'PENDING' || userStatus === 'REJECTED') {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse;
  }

  // Unauthenticated → login
  if (!user && (isProtectedRoute || isAdminRoute || isSuperAdminRoute)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // PENDING/REJECTED users trying to access protected routes → pending-approval
  if (user && (isProtectedRoute || isAdminRoute || isSuperAdminRoute)) {
    const userStatus = user.user_metadata?.status || 'PENDING';
    if (userStatus === 'PENDING' || userStatus === 'REJECTED') {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
  }

  // Super-admin role check
  if (user && isSuperAdminRoute) {
    const userRole = user.user_metadata?.role || 'MEMBER';
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin role check
  if (user && isAdminRoute) {
    const userRole = user.user_metadata?.role || 'MEMBER';
    if (userRole === 'MEMBER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
