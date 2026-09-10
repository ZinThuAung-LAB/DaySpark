import { monitoringEndpoint } from '../config/env'

type ErrorContext = { source: string }

function serializeError(error: unknown): { message: string; name: string } {
  if (error instanceof Error) return { name: error.name, message: error.message.slice(0, 500) }
  return { name: 'Error', message: String(error).slice(0, 500) }
}

export function reportClientError(error: unknown, context: ErrorContext): void {
  const payload = { ...serializeError(error), source: context.source, path: window.location.pathname, occurredAt: new Date().toISOString() }
  console.error('[DaySpark client error]', payload)
  if (!monitoringEndpoint) return
  const body = JSON.stringify(payload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(monitoringEndpoint, new Blob([body], { type: 'application/json' }))
  } else {
    void fetch(monitoringEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined)
  }
}

export function installGlobalErrorMonitoring(): void {
  window.addEventListener('error', (event) => reportClientError(event.error ?? event.message, { source: 'window.error' }))
  window.addEventListener('unhandledrejection', (event) => reportClientError(event.reason, { source: 'window.unhandledrejection' }))
}
