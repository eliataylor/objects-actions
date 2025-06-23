import { NextResponse, type NextRequest } from 'next/server'
import { NAVITEMS } from './types/types'
import NextAuth from "next-auth";
import { authConfig } from "~/server/auth/auth.config";

// Initialize Edge-compatible auth
const { auth: nextAuthMiddleware, auth } = NextAuth(authConfig);

export default nextAuthMiddleware(async function middleware(request: NextRequest) {
  const session = await auth()
  const isAuthenticated = !!session?.user
  const isAdmin = session?.user?.role === 'admin'
  const { pathname } = request.nextUrl

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Find matching nav item for the current path
  const navItem = NAVITEMS.find(item => pathname.startsWith(`/${item.segment}`))
  
  if (!navItem) {
    return NextResponse.next()
  }

  // Handle different permission levels
  switch (navItem.permissions) {
    case 'AllowAny':
      return NextResponse.next()
      
    case 'IsAuthenticatedOrReadOnly':
      if (request.method === 'GET') {
        return NextResponse.next()
      }
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/api/auth/signin', request.url))
      }
      return NextResponse.next()
      
    case 'IsAuthenticated':
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/api/auth/signin', request.url))
      }
      return NextResponse.next()
      
    case 'IsAdmin':
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/api/auth/signin', request.url))
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return NextResponse.next()
      
    default:
      return NextResponse.next()
  }
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 