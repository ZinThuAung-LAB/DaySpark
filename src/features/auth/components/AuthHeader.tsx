import { useState } from 'react'
import type { UserProfile } from '../types/auth'

type AuthHeaderProps = {
  loading: boolean
  onSignIn: () => void
  onProfile: () => void
  onSignOut: () => void
  user: UserProfile | null
}

function getInitial(user: UserProfile): string {
  return (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()
}

export function AuthHeader({ loading, onProfile, onSignIn, onSignOut, user }: AuthHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  if (!user) {
    return <button className="min-h-11 rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed" disabled={loading} onClick={onSignIn} type="button">Sign In</button>
  }

  return (
    <div className="relative text-sm">
      <button aria-controls="user-menu" aria-expanded={isMenuOpen} aria-label="Open user menu" className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-amber-100 font-bold text-amber-900 transition hover:ring-2 hover:ring-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" onClick={() => setIsMenuOpen((open) => !open)} type="button">
        {user.photoURL ? <img alt="" className="size-11 object-cover" src={user.photoURL} /> : getInitial(user)}
      </button>
      {isMenuOpen && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg" id="user-menu">
          <p className="truncate px-3 py-2 text-sm text-slate-600">{user.email ?? 'Signed in'}</p>
          <button className="w-full rounded-lg px-3 py-2.5 text-left font-semibold text-slate-700 hover:bg-amber-50" onClick={() => { onProfile(); setIsMenuOpen(false) }} type="button">Profile</button>
          <button className="w-full rounded-lg px-3 py-2.5 text-left font-semibold text-slate-700 hover:bg-amber-50 disabled:cursor-not-allowed" disabled={loading} onClick={onSignOut} type="button">Sign Out</button>
        </div>
      )}
    </div>
  )
}
