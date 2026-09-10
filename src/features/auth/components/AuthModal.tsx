import { useState, type FormEvent } from 'react'
import { sanitizeEmail } from '../../../utils/input-sanitization'

type AuthMode = 'login' | 'signUp'

type AuthModalProps = {
  error: string | null
  loading: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => Promise<unknown>
  onSignUp: (email: string, password: string) => Promise<unknown>
}

function validate(email: string, password: string): string | null {
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Enter a valid email address.'
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters.'
  }

  return null
}

export function AuthModal({ error, loading, onClose, onLogin, onSignUp }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const sanitizedEmail = sanitizeEmail(email)
    const nextValidationError = validate(sanitizedEmail, password)
    setValidationError(nextValidationError)

    if (nextValidationError) {
      return
    }

    try {
      if (mode === 'login') {
        await onLogin(sanitizedEmail, password)
      } else {
        await onSignUp(sanitizedEmail, password)
      }
      onClose()
    } catch {
      // The hook exposes a user-facing error below the form.
    }
  }

  const message = validationError ?? error
  const actionLabel = mode === 'login' ? 'Sign In' : 'Create Account'

  return (
    <div aria-labelledby="auth-modal-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">DaySpark account</p>
            <h2 id="auth-modal-title" className="mt-2 text-2xl font-bold text-slate-900">Save your progress anywhere</h2>
          </div>
          <button aria-label="Close sign in dialog" className="min-h-11 min-w-11 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" onClick={onClose} type="button">×</button>
        </div>
        <div aria-label="Authentication mode" className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="tablist">
          {(['login', 'signUp'] as const).map((nextMode) => (
            <button
              aria-selected={mode === nextMode}
              className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition ${mode === nextMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              key={nextMode}
              onClick={() => { setMode(nextMode); setValidationError(null) }}
              role="tab"
              type="button"
            >
              {nextMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-800" htmlFor="auth-email">
            Email
            <input
              aria-describedby={message ? 'auth-error' : undefined}
              aria-invalid={Boolean(message)}
              autoComplete="email"
              autoFocus
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              id="auth-email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="block text-sm font-medium text-slate-800" htmlFor="auth-password">
            Password
            <input
              aria-describedby={message ? 'auth-error' : undefined}
              aria-invalid={Boolean(message)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              id="auth-password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          {message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" id="auth-error" role="alert">{message}</p>}
          <button className="min-h-11 w-full rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:bg-slate-200" disabled={loading} type="submit">
            {loading ? 'Please wait…' : actionLabel}
          </button>
        </form>
      </section>
    </div>
  )
}
