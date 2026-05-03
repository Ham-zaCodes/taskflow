'use client'
/**
 * app/signup/page.tsx
 * Registration form. On success redirects to /dashboard.
 */

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signup(name, email, password)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'var(--accent-glow)', filter: 'blur(120px)' }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <span className="font-display text-2xl font-700" style={{ color: 'var(--text)' }}>TaskFlow</span>
          </div>
          <h1 className="font-display text-2xl font-700" style={{ color: 'var(--text)' }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Get started for free today</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--priority-high)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Full name
              </label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Email address
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Password <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(min. 6 chars)</span>
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
              style={{ padding: '0.75rem' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-500" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
