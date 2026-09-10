import type { CompletedActivity } from '../activityHistory/types'
import type { Mood } from '../../types/preferences'

export type MoodBreakdown = {
  mood: Mood
  label: string
  count: number
  percentage: number
}

export type XPGrowthPoint = {
  date: string
  label: string
  totalXP: number
}

export type MoodAnalyticsData = {
  activityVolume: { last7Days: number; last30Days: number }
  insight: string
  topMoods: MoodBreakdown[]
  xpGrowth: XPGrowthPoint[]
}

const DAY_IN_MS = 86_400_000
const moodLabels: Record<Mood, string> = {
  bored: 'Bored',
  relaxed: 'Relaxed',
  productive: 'Productive',
  social: 'Social',
  adventurous: 'Adventurous',
}

function isValidCompletionDate(activity: CompletedActivity): boolean {
  return Number.isFinite(Date.parse(activity.completedAt))
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}

function buildInsight(activities: readonly CompletedActivity[], topMoods: readonly MoodBreakdown[]): string {
  if (topMoods.length === 0) {
    return 'Complete activities after choosing a mood to reveal your personal trends.'
  }

  const weekendCounts = new Map<Mood, number>()
  activities.forEach((activity) => {
    if (!activity.mood || !isValidCompletionDate(activity)) return
    const day = new Date(activity.completedAt).getDay()
    if (day === 0 || day === 6) {
      weekendCounts.set(activity.mood, (weekendCounts.get(activity.mood) ?? 0) + 1)
    }
  })
  const weekendLeader = [...weekendCounts.entries()].sort((first, second) => second[1] - first[1])[0]

  if (weekendLeader) {
    return `You tend to seek ${moodLabels[weekendLeader[0]]} activities most often on weekends.`
  }

  return `${moodLabels[topMoods[0].mood]} is your most common mood for completed activities.`
}

export function aggregateMoodAnalytics(
  completedActivities: readonly CompletedActivity[],
  now: Date = new Date(),
): MoodAnalyticsData {
  const validActivities = completedActivities.filter(isValidCompletionDate)
  const moodCounts = new Map<Mood, number>()
  validActivities.forEach((activity) => {
    if (activity.mood) moodCounts.set(activity.mood, (moodCounts.get(activity.mood) ?? 0) + 1)
  })
  const trackedMoodCount = [...moodCounts.values()].reduce((total, count) => total + count, 0)
  const topMoods = [...moodCounts.entries()]
    .map(([mood, count]) => ({ mood, label: moodLabels[mood], count, percentage: Math.round((count / trackedMoodCount) * 100) }))
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))

  const nowMs = now.getTime()
  const activityVolume = validActivities.reduce(
    (volume, activity) => {
      const age = nowMs - new Date(activity.completedAt).getTime()
      return {
        last7Days: volume.last7Days + (age >= 0 && age < DAY_IN_MS * 7 ? 1 : 0),
        last30Days: volume.last30Days + (age >= 0 && age < DAY_IN_MS * 30 ? 1 : 0),
      }
    },
    { last7Days: 0, last30Days: 0 },
  )

  let cumulativeXP = 0
  const xpByDate = new Map<string, XPGrowthPoint>()
  validActivities
    .slice()
    .sort((first, second) => new Date(first.completedAt).getTime() - new Date(second.completedAt).getTime())
    .forEach((activity) => {
      cumulativeXP += Math.max(0, activity.xpReward)
      const completionDate = new Date(activity.completedAt)
      const key = dateKey(completionDate)
      xpByDate.set(key, { date: key, label: formatDate(completionDate), totalXP: cumulativeXP })
    })

  return {
    activityVolume,
    insight: buildInsight(validActivities, topMoods),
    topMoods,
    xpGrowth: [...xpByDate.values()],
  }
}
