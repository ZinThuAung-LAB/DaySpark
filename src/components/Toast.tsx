import { useEffect } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

type ToastProps = {
  kind: ToastKind
  message: string
  onDismiss: () => void
}

export function Toast({ kind, message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 4500)
    return () => window.clearTimeout(timeout)
  }, [message, onDismiss])

  return (
    <div aria-live={kind === 'error' ? 'assertive' : 'polite'} className={`fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${kind === 'error' ? 'border-red-200 bg-red-50 text-red-900' : kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-900'}`} role={kind === 'error' ? 'alert' : undefined}>
      <span>{message}</span>
      <button aria-label="Dismiss notification" className="min-h-11 min-w-11 rounded-lg text-lg leading-none hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current" onClick={onDismiss} type="button">×</button>
    </div>
  )
}
