/**
 * app/api/auth/logout/route.ts
 * POST /api/auth/logout
 * Clears the auth cookie.
 */

import { ok } from '@/lib/api'

export async function POST() {
  const response = ok(null, 'Logged out successfully')
  // Expire the cookie immediately
  response.cookies.set('auth-token', '', { maxAge: 0, path: '/' })
  return response
}
