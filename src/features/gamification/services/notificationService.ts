import { readLocalStorage, writeLocalStorage } from '../../../utils/local-storage'

const REMINDERS_ENABLED_KEY = 'dayspark.activity-reminders-enabled'
export const REMINDER_SETTINGS_CHANGED_EVENT = 'dayspark:reminder-settings-changed'

export function areActivityRemindersEnabled(): boolean {
  return readLocalStorage(REMINDERS_ENABLED_KEY) === 'true'
}

export async function setActivityRemindersEnabled(enabled: boolean): Promise<boolean> {
  if (!enabled) {
    writeLocalStorage(REMINDERS_ENABLED_KEY, 'false')
    window.dispatchEvent(new Event(REMINDER_SETTINGS_CHANGED_EVENT))
    return false
  }
  if (typeof Notification === 'undefined') return false
  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  const isEnabled = permission === 'granted'
  writeLocalStorage(REMINDERS_ENABLED_KEY, String(isEnabled))
  window.dispatchEvent(new Event(REMINDER_SETTINGS_CHANGED_EVENT))
  return isEnabled
}

/** Schedules an in-session 7 PM reminder. Reliable background delivery requires an installed PWA service worker. */
export function scheduleDailyActivityReminder(hasCompletedToday: boolean): () => void {
  if (!areActivityRemindersEnabled() || hasCompletedToday || typeof Notification === 'undefined' || Notification.permission !== 'granted') return () => undefined
  const now = new Date()
  const reminderTime = new Date(now)
  reminderTime.setHours(19, 0, 0, 0)
  if (reminderTime <= now) reminderTime.setDate(reminderTime.getDate() + 1)
  const timer = window.setTimeout(() => {
    new Notification('DaySpark reminder', { body: 'There is still time to complete an activity and keep your streak going.' })
  }, reminderTime.getTime() - now.getTime())
  return () => window.clearTimeout(timer)
}
