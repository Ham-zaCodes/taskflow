'use client'
/**
 * components/layout/Navbar.tsx
 * Top navigation bar with user info and logout.
 */

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

export function Navbar() {
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-14"
      style={{
        background: 'rgba(13,15,20,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <span className="font-display font-700 text-base" style={{ color: 'var(--text)' }}>TaskFlow</span>
      </div>

      {/* User section */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-500" style={{ color: 'var(--text)' }}>{user.name}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {initials}
          </div>

          {/* Logout */}
          <button
            className="btn btn-ghost"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </header>
  )
}
