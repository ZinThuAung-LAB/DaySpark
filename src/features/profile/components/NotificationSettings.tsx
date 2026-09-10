import { useState } from 'react'
import { areActivityRemindersEnabled, setActivityRemindersEnabled } from '../../gamification/services/notificationService'

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(areActivityRemindersEnabled)
  const [message, setMessage] = useState<string | null>(null)

  async function handleChange() {
    const nextEnabled = await setActivityRemindersEnabled(!enabled)
    setEnabled(nextEnabled)
    setMessage(nextEnabled ? 'Daily reminders are on for 7:00 PM.' : 'Reminders are off. Allow notifications in your browser to turn them on.')
  }

  return (
    <section aria-labelledby="notification-settings-heading" className="rounded-2xl border border-slate-200 p-5">
      <h3 id="notification-settings-heading" className="text-xl font-bold text-slate-900">Notification settings</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">Get a 7:00 PM reminder when no activity has been completed today. Reminders work while DaySpark is open; install the PWA for background delivery.</p>
      <button aria-pressed={enabled} className="mt-4 min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" onClick={() => { void handleChange() }} type="button">{enabled ? 'Turn off daily reminders' : 'Turn on daily reminders'}</button>
      {message && <p className="mt-3 text-sm font-medium text-slate-700" role="status">{message}</p>}
    </section>
  )
}
