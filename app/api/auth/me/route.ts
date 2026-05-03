/**
 * app/api/auth/me/route.ts
 * GET /api/auth/me
 * Returns the currently authenticated user from the JWT cookie.
 */

import { getAuthUser } from '@/lib/auth'
import { ok, err } from '@/lib/api'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return err('Not authenticated', 401)
  return ok({ userId: user.userId, email: user.email, name: user.name })
}
