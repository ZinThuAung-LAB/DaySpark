import type { CompletedActivity } from './types'
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from '../../utils/local-storage'

export const COMPLETED_ACTIVITIES_STORAGE_KEY = 'dayspark.completed-activities'

function sortNewestFirst(completedActivities: CompletedActivity[]): CompletedActivity[] {
  return [...completedActivities].sort(
    (first, second) => new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime(),
  )
}

function isCompletedActivity(value: unknown): value is CompletedActivity {
  if (!value || typeof value !== 'object') {
    return false
  }

  const completedActivity = value as Record<string, unknown>
  return (
    typeof completedActivity.completionId === 'string' &&
    completedActivity.completionId.length > 0 &&
    typeof completedActivity.activityId === 'string' &&
    completedActivity.activityId.length > 0 &&
    typeof completedActivity.activityTitle === 'string' &&
    typeof completedActivity.completedAt === 'string' &&
    Number.isFinite(Date.parse(completedActivity.completedAt)) &&
    typeof completedActivity.xpReward === 'number' &&
    Number.isFinite(completedActivity.xpReward)
  )
}

export function loadCompletedActivities(): CompletedActivity[] {
  try {
    const storedValue = readLocalStorage(COMPLETED_ACTIVITIES_STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? sortNewestFirst(parsedValue.filter(isCompletedActivity)) : []
  } catch {
    return []
  }
}

export function saveCompletedActivity(completedActivity: CompletedActivity): CompletedActivity[] {
  const currentActivities = loadCompletedActivities()

  if (currentActivities.some((activity) => activity.completionId === completedActivity.completionId)) {
    return currentActivities
  }

  const updatedActivities = sortNewestFirst([completedActivity, ...currentActivities])
  writeLocalStorage(COMPLETED_ACTIVITIES_STORAGE_KEY, JSON.stringify(updatedActivities))

  return updatedActivities
}

export function clearCompletedActivities(): void {
  removeLocalStorage(COMPLETED_ACTIVITIES_STORAGE_KEY)
}
