import type { UserProfile } from '../types/auth'

type AuthHeaderProps = {
  loading: boolean
  onSignIn: () => void
  onSignOut: () => void
  user: UserProfile | null
}

function getInitial(user: UserProfile): string {
  return (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()
}

export function AuthHeader({ loading, onSignIn, onSignOut, user }: AuthHeaderProps) {
  if (!user) {
    return <button className="min-h-11 rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed" disabled={loading} onClick={onSignIn} type="button">Sign In</button>
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
      {user.photoURL ? <img alt="" className="size-9 rounded-full object-cover" src={user.photoURL} /> : <span aria-label="User avatar" className="flex size-9 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-900">{getInitial(user)}</span>}
      <span className="max-w-48 truncate font-medium text-slate-700">{user.displayName ?? user.email ?? 'Signed in'}</span>
      <button className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-amber-500 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed" disabled={loading} onClick={onSignOut} type="button">Sign Out</button>
    </div>
  )
}
