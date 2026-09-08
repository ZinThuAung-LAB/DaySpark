import type { Activity } from '../../types/activity'
import type { AvailableTime, CompletePreferences } from '../../types/preferences'
import type { CompletedActivity } from '../activityHistory/types'

type ScoredActivity = {
  activity: Activity
  score: number
  tieBreaker: number
}

export type RecommendationOptions = {
  completedActivities?: readonly CompletedActivity[]
  excludedActivityIds?: ReadonlySet<string>
  now?: Date
  randomizer?: () => number
}

const durations: Record<AvailableTime, number> = {
  '10-minutes': 1,
  '30-minutes': 2,
  '1-hour': 3,
  '2-plus-hours': 4,
}

function fitsAvailableTime(activity: Activity, preferences: CompletePreferences): boolean {
  return durations[activity.duration] <= durations[preferences.availableTime]
}

function scoreActivity(activity: Activity, preferences: CompletePreferences): number {
  const moodScore = activity.moods.includes(preferences.mood) ? 40 : 0
  const energyScore = activity.energy === preferences.energy ? 25 : 0
  const durationScore = fitsAvailableTime(activity, preferences) ? 20 : 0
  const budgetScore = activity.budget === preferences.budget ? 15 : 0

  return moodScore + energyScore + durationScore + budgetScore
}

function getCompletionPenalty(
  activityId: string,
  completedActivities: readonly CompletedActivity[],
  now: Date,
): number {
  const latestCompletion = completedActivities
    .filter((activity) => activity.activityId === activityId)
    .sort((first, second) => new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime())[0]

  if (!latestCompletion) {
    return 0
  }

  const ageInDays = Math.max(0, (now.getTime() - new Date(latestCompletion.completedAt).getTime()) / 86_400_000)

  if (ageInDays <= 3) {
    return -30
  }

  if (ageInDays <= 7) {
    return -15
  }

  return -5
}

/**
 * Selects up to three activities that fit the available time. Mood, energy,
 * budget, and completion recency affect ranking; only explicitly excluded IDs
 * (such as currently visible cards) are removed from the candidate pool.
 */
export function getRecommendations(
  preferences: CompletePreferences,
  activityCatalog: readonly Activity[],
  options: RecommendationOptions = {},
): Activity[] {
  const {
    completedActivities = [],
    excludedActivityIds = new Set(),
    now = new Date(),
    randomizer = Math.random,
  } = options
  const seenIds = new Set<string>()

  return activityCatalog
    .filter((activity) => {
      if (excludedActivityIds.has(activity.id) || seenIds.has(activity.id)) {
        return false
      }

      seenIds.add(activity.id)
      return fitsAvailableTime(activity, preferences)
    })
    .map<ScoredActivity>((activity) => ({
      activity,
      score: scoreActivity(activity, preferences) + getCompletionPenalty(activity.id, completedActivities, now),
      tieBreaker: randomizer() * 4,
    }))
    .sort((first, second) => second.score - first.score || second.tieBreaker - first.tieBreaker)
    .slice(0, 3)
    .map(({ activity }) => activity)
}
