/**
 * app/api/auth/login/route.ts
 * POST /api/auth/login
 * Authenticates a user and returns a signed JWT cookie.
 */

import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { signToken } from '@/lib/auth'
import { ok, err } from '@/lib/api'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // ── Input validation ──────────────────────────────────────────────────────
    if (!email || !password) {
      return err('Email and password are required', 400)
    }

    await connectDB()

    // ── Find user and explicitly select the hashed password ───────────────────
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user) {
      // Generic message to prevent user enumeration
      return err('Invalid email or password', 401)
    }

    // ── Verify password ───────────────────────────────────────────────────────
    const valid = await user.comparePassword(password)
    if (!valid) {
      return err('Invalid email or password', 401)
    }

    // ── Issue JWT and set HTTP-only cookie ────────────────────────────────────
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    const response = ok(
      { _id: user._id, name: user.name, email: user.email },
      'Logged in successfully'
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[login]', error)
    return err('Internal server error', 500)
  }
}
