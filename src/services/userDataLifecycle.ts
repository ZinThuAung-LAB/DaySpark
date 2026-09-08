export const USER_DATA_CHANGED_EVENT = 'dayspark:user-data-changed'

export function notifyUserDataChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(USER_DATA_CHANGED_EVENT))
  }
}
