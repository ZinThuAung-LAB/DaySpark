export function sanitizePlainText(value: string, maxLength = 120): string {
  return Array.from(value).filter((character) => character >= ' ' && character !== '\u007F').join('').trim().slice(0, maxLength)
}

export function sanitizeEmail(value: string): string {
  return sanitizePlainText(value, 254).toLowerCase()
}

export function sanitizeHttpUrl(value: string): string | null {
  const candidate = sanitizePlainText(value, 2_048)
  if (!candidate) return null
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}
