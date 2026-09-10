import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportClientError } from '../services/monitoring'

type ErrorBoundaryProps = { children: ReactNode }
type ErrorBoundaryState = { hasError: boolean }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportClientError(error, { source: errorInfo.componentStack ? 'react.error-boundary' : 'react.error-boundary-unknown' })
  }

  render() {
    if (this.state.hasError) {
      return <main className="grid min-h-screen place-items-center bg-amber-50 p-6 text-center text-slate-900"><section className="max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-amber-950/5"><h1 className="text-2xl font-bold">Something went wrong</h1><p className="mt-3 text-slate-600">DaySpark could not load this view. Your saved progress is still on this device.</p><button className="mt-6 min-h-11 rounded-lg bg-amber-500 px-4 py-2 font-semibold" onClick={() => window.location.reload()} type="button">Reload DaySpark</button></section></main>
    }
    return this.props.children
  }
}
