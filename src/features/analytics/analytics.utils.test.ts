import type { CompletedActivity } from '../activityHistory/types'
import { aggregateMoodAnalytics } from './analytics.utils'

function completion(id: string, completedAt: string, xpReward: number, mood?: CompletedActivity['mood']): CompletedActivity {
  return { completionId: id, activityId: `activity-${id}`, activityTitle: `Activity ${id}`, completedAt, xpReward, mood }
}

describe('aggregateMoodAnalytics', () => {
  const now = new Date('2026-09-10T12:00:00.000Z')

  it('aggregates mood frequencies and rolling activity volume', () => {
    const analytics = aggregateMoodAnalytics([
      completion('one', '2026-09-09T12:00:00.000Z', 10, 'relaxed'),
      completion('two', '2026-09-05T12:00:00.000Z', 15, 'relaxed'),
      completion('three', '2026-08-20T12:00:00.000Z', 20, 'productive'),
      completion('four', '2026-08-01T12:00:00.000Z', 30, 'bored'),
    ], now)

    expect(analytics.topMoods).toEqual([
      { mood: 'relaxed', label: 'Relaxed', count: 2, percentage: 50 },
      { mood: 'bored', label: 'Bored', count: 1, percentage: 25 },
      { mood: 'productive', label: 'Productive', count: 1, percentage: 25 },
    ])
    expect(analytics.activityVolume).toEqual({ last7Days: 2, last30Days: 3 })
  })

  it('formats cumulative XP chart points by calendar day', () => {
    const analytics = aggregateMoodAnalytics([
      completion('newer', '2026-09-09T08:00:00.000Z', 25, 'social'),
      completion('first', '2026-09-08T08:00:00.000Z', 10, 'social'),
      completion('same-day', '2026-09-08T12:00:00.000Z', 15, 'productive'),
    ], now)

    expect(analytics.xpGrowth).toEqual([
      { date: '2026-09-08', label: 'Sep 8', totalXP: 25 },
      { date: '2026-09-09', label: 'Sep 9', totalXP: 50 },
    ])
  })

  it('uses a weekend-specific insight when weekend mood history exists', () => {
    const analytics = aggregateMoodAnalytics([
      completion('saturday', '2026-09-05T12:00:00.000Z', 10, 'relaxed'),
      completion('weekday', '2026-09-08T12:00:00.000Z', 10, 'productive'),
    ], now)

    expect(analytics.insight).toBe('You tend to seek Relaxed activities most often on weekends.')
  })
})
