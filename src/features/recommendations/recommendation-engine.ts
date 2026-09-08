import type { Activity } from '../../types/activity'
import type { AvailableTime, Budget, CompletePreferences, EnergyLevel } from '../../types/preferences'

type ScoredActivity = {
  activity: Activity
  score: number
  tieBreaker: number
}

const energyLevels: Record<EnergyLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

const durations: Record<AvailableTime, number> = {
  '10-minutes': 1,
  '30-minutes': 2,
  '1-hour': 3,
  '2-plus-hours': 4,
}

const budgets: Record<Budget, number> = {
  free: 1,
  low: 2,
  flexible: 3,
}

function isCompatible(activity: Activity, preferences: CompletePreferences): boolean {
  return (
    energyLevels[activity.energy] <= energyLevels[preferences.energy] &&
    durations[activity.duration] <= durations[preferences.availableTime] &&
    budgets[activity.budget] <= budgets[preferences.budget]
  )
}

function scoreActivity(activity: Activity, preferences: CompletePreferences): number {
  const moodScore = activity.moods.includes(preferences.mood) ? 100 : 0
  const energyScore = activity.energy === preferences.energy ? 20 : 7
  const durationScore = activity.duration === preferences.availableTime ? 15 : 6
  const budgetScore = activity.budget === preferences.budget ? 10 : 4

  return moodScore + energyScore + durationScore + budgetScore
}

/**
 * Selects up to three compatible activities. Mood matches are ranked first;
 * when fewer than three exist, compatible activities for other moods fill the gaps.
 * Supply a randomizer in tests to make tie ordering deterministic.
 */
export function getRecommendations(
  preferences: CompletePreferences,
  activityCatalog: readonly Activity[],
  randomizer: () => number = Math.random,
): Activity[] {
  const seenIds = new Set<string>()

  return activityCatalog
    .filter((activity) => {
      if (seenIds.has(activity.id)) {
        return false
      }

      seenIds.add(activity.id)
      return isCompatible(activity, preferences)
    })
    .map<ScoredActivity>((activity) => ({
      activity,
      score: scoreActivity(activity, preferences),
      tieBreaker: randomizer(),
    }))
    .sort((first, second) => second.score - first.score || second.tieBreaker - first.tieBreaker)
    .slice(0, 3)
    .map(({ activity }) => activity)
}
