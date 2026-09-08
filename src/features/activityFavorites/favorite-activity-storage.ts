import { readLocalStorage, removeLocalStorage, writeLocalStorage } from '../../utils/local-storage'

export const FAVORITE_ACTIVITY_IDS_STORAGE_KEY = 'dayspark.favorite-activity-ids'

function isFavoriteActivityId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

export function loadFavoriteActivityIds(): string[] {
  try {
    const storedValue = readLocalStorage(FAVORITE_ACTIVITY_IDS_STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? [...new Set(parsedValue.filter(isFavoriteActivityId))] : []
  } catch {
    return []
  }
}

function saveFavoriteActivityIds(favoriteActivityIds: readonly string[]): string[] {
  const uniqueFavoriteActivityIds = [...new Set(favoriteActivityIds)]
  writeLocalStorage(FAVORITE_ACTIVITY_IDS_STORAGE_KEY, JSON.stringify(uniqueFavoriteActivityIds))

  return uniqueFavoriteActivityIds
}

export function saveFavoriteActivityId(activityId: string): string[] {
  return saveFavoriteActivityIds([...loadFavoriteActivityIds(), activityId])
}

export function removeFavoriteActivityId(activityId: string): string[] {
  return saveFavoriteActivityIds(loadFavoriteActivityIds().filter((currentActivityId) => currentActivityId !== activityId))
}

export function clearFavoriteActivityIds(): void {
  removeLocalStorage(FAVORITE_ACTIVITY_IDS_STORAGE_KEY)
}
