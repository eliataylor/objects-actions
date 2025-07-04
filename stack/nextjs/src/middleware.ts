import { NextResponse, type NextRequest } from 'next/server'
import { NAVITEMS } from './types/types'

// Mock session data for development - replace with real auth when allauth is integrated
function getMockSession() {
  return {
    user: {
      id: "mock-user-1",
      name: "Mock User",
      email: "mock@example.com",
      role: "admin" // Change to "user" to test different permission levels
    }
  };
}

export default function middleware(request: NextRequest) {
  // Mock session for development
  const session = getMockSession();
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === 'admin';
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Find matching nav item for the current path
  const navItem = NAVITEMS.find(item => pathname.startsWith(`/${item.segment}`));
  
  if (!navItem) {
    return NextResponse.next();
  }

  // Handle different permission levels (currently using mock session)
  switch (navItem.permissions) {
    case 'AllowAny':
      return NextResponse.next();
      
    case 'IsAuthenticatedOrReadOnly':
      if (request.method === 'GET') {
        return NextResponse.next();
      }
      if (!isAuthenticated) {
        // TODO: Replace with allauth signin URL when integrated
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
      
    case 'IsAuthenticated':
      if (!isAuthenticated) {
        // TODO: Replace with allauth signin URL when integrated
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
      
    case 'IsAdmin':
      if (!isAuthenticated) {
        // TODO: Replace with allauth signin URL when integrated
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
      
    default:
      return NextResponse.next();
  }
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 