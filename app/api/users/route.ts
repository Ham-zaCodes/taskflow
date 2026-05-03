/**
 * app/api/users/route.ts
 * GET /api/users
 * Returns all users (name + id) for the task-assignment dropdown.
 * Requires authentication.
 */

import { getAuthUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/api'
import User from '@/models/User'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return err('Not authenticated', 401)

  await connectDB()

  // Only return public fields – never the password
  const users = await User.find({}).select('_id name email').sort({ name: 1 }).lean()

  return ok(users)
}
