/**
 * lib/mongodb.ts
 * Singleton MongoDB connection using Mongoose.
 * Caches the connection across hot-reloads in development so we don't
 * exhaust the connection pool.
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local'
  )
}

// Extend the NodeJS global type to cache the mongoose promise
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

// Initialise cache on the global object (persists across HMR reloads)
let cached = global._mongooseCache

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null }
}

export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) return cached.conn

  // Create a new connection promise if one isn't in flight
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}
