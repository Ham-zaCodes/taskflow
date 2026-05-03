/**
 * middleware.ts
 * Runs on every request that matches the `matcher` pattern below.
 * Redirects unauthenticated users away from protected routes and
 * authenticated users away from auth pages.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Routes that require the user to be logged IN
const PROTECTED = ['/dashboard']

// Routes that require the user to be logged OUT
const AUTH_ONLY = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  const user = token ? await verifyToken(token) : null

  // Redirect unauthenticated users away from protected pages
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login/signup
  if (AUTH_ONLY.includes(pathname) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
