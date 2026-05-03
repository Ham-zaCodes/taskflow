/**
 * lib/api.ts
 * Lightweight helpers for building consistent JSON API responses.
 */

import { NextResponse } from 'next/server'

/** Return a successful JSON response */
export function ok<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status })
}

/** Return an error JSON response */
export function err(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}
