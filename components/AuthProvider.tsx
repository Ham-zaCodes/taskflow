'use client'
/**
 * components/AuthProvider.tsx
 * React context that holds the current user and exposes login/logout helpers.
 * Wraps the entire application so any client component can call `useAuth()`.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser } from '@/types'

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  /** Fetch the current session from the server */
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const { data } = await res.json()
        setUser({ _id: data.userId, name: data.name, email: data.email })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Check session on mount
  useEffect(() => { refresh() }, [refresh])

  /** Attempt login; returns an error string on failure, null on success */
  const login = async (email: string, password: string): Promise<string | null> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (!json.success) return json.error
    setUser({ _id: json.data._id, name: json.data.name, email: json.data.email })
    return null
  }

  /** Attempt signup; returns an error string on failure, null on success */
  const signup = async (name: string, email: string, password: string): Promise<string | null> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const json = await res.json()
    if (!json.success) return json.error
    setUser({ _id: json.data._id, name: json.data.name, email: json.data.email })
    return null
  }

  /** Clear the session cookie and redirect to login */
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
