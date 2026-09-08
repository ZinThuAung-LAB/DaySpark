export function readLocalStorage(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeLocalStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }
  } catch {
    // Persistence is optional; callers keep their in-memory state usable.
  }
}

export function removeLocalStorage(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
  } catch {
    // Persistence is optional; callers keep their in-memory state usable.
  }
}
