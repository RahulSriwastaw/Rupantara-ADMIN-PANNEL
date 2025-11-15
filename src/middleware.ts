import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow login page and API routes
  if (pathname === '/login' || pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // For dashboard routes, the client-side layout will handle auth
  // This middleware just logs for now
  console.log('Middleware called for:', pathname)
  
  // Continue with the request
  return NextResponse.next()
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
}