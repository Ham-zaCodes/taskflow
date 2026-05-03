/**
 * app/api/auth/signup/route.ts
 * POST /api/auth/signup
 * Creates a new user account and returns a signed JWT cookie.
 */

import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { signToken } from '@/lib/auth'
import { ok, err } from '@/lib/api'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // ── Input validation ──────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return err('Name, email and password are required', 400)
    }
    if (password.length < 6) {
      return err('Password must be at least 6 characters', 400)
    }

    await connectDB()

    // ── Duplicate check ───────────────────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return err('An account with this email already exists', 409)
    }

    // ── Create user (password is hashed by the pre-save hook) ─────────────────
    const user = await User.create({ name: name.trim(), email, password })

    // ── Issue JWT and set HTTP-only cookie ────────────────────────────────────
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    const response = ok(
      { _id: user._id, name: user.name, email: user.email },
      'Account created successfully',
      201
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,   // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[signup]', error)
    return err('Internal server error', 500)
  }
}
