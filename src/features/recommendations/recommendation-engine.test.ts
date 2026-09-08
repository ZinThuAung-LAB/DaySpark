import type { CompletedActivity } from '../activityHistory/types'
import type { Activity } from '../../types/activity'
import type { CompletePreferences } from '../../types/preferences'
import { getRecommendations, type RecommendationOptions } from './recommendation-engine'

const now = new Date('2026-09-08T12:00:00.000Z')
const noRandomness = () => 0

const preferences: CompletePreferences = {
  mood: 'productive',
  energy: 'medium',
  availableTime: '30-minutes',
  budget: 'low',
}

function createActivity(id: string, overrides: Partial<Omit<Activity, 'id'>> = {}): Activity {
  return {
    id,
    title: id,
    description: `Description for ${id}`,
    moods: ['productive'],
    energy: 'medium',
    duration: '30-minutes',
    budget: 'low',
    category: 'productivity',
    xpReward: 20,
    ...overrides,
  }
}

function completion(activityId: string, completedAt: string): CompletedActivity {
  return {
    completionId: `completion-${activityId}-${completedAt}`,
    activityId,
    activityTitle: activityId,
    completedAt,
    xpReward: 20,
  }
}

function options(overrides: RecommendationOptions = {}): RecommendationOptions {
  return { now, randomizer: noRandomness, ...overrides }
}

describe('getRecommendations', () => {
  it('returns three unused top matches when there is no completion history', () => {
    const result = getRecommendations(
      preferences,
      [createActivity('one'), createActivity('two'), createActivity('three'), createActivity('four')],
      options(),
    )

    expect(result.map((activity) => activity.id)).toEqual(['one', 'two', 'three'])
  })

  it('prioritizes unused activities when the user has completed three activities', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('completed-one'),
        createActivity('completed-two'),
        createActivity('completed-three'),
        createActivity('unused-one'),
        createActivity('unused-two'),
      ],
      options({
        completedActivities: [
          completion('completed-one', '2026-09-07T12:00:00.000Z'),
          completion('completed-two', '2026-09-07T12:00:00.000Z'),
          completion('completed-three', '2026-09-07T12:00:00.000Z'),
        ],
      }),
    )

    expect(result.map((activity) => activity.id)).toEqual(['unused-one', 'unused-two', 'completed-one'])
  })

  it('continues to return unused activities after ten completions', () => {
    const activityCatalog = Array.from({ length: 13 }, (_, index) => createActivity(`activity-${index + 1}`))
    const completedActivities = activityCatalog.slice(0, 10).map((activity) => completion(activity.id, '2026-09-07T12:00:00.000Z'))

    const result = getRecommendations(preferences, activityCatalog, options({ completedActivities }))

    expect(result.map((activity) => activity.id)).toEqual(['activity-11', 'activity-12', 'activity-13'])
  })

  it('still returns three activities when most of the matching catalog was completed recently', () => {
    const activityCatalog = Array.from({ length: 6 }, (_, index) => createActivity(`activity-${index + 1}`))
    const completedActivities = activityCatalog.slice(0, 5).map((activity) => completion(activity.id, '2026-09-07T12:00:00.000Z'))

    const result = getRecommendations(preferences, activityCatalog, options({ completedActivities }))

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('activity-6')
  })

  it('can reuse older activities when almost every matching activity was completed', () => {
    const activityCatalog = [createActivity('old'), createActivity('middle'), createActivity('recent')]
    const result = getRecommendations(
      preferences,
      activityCatalog,
      options({
        completedActivities: [
          completion('old', '2026-08-30T12:00:00.000Z'),
          completion('middle', '2026-09-04T12:00:00.000Z'),
          completion('recent', '2026-09-07T12:00:00.000Z'),
        ],
      }),
    )

    expect(result.map((activity) => activity.id)).toEqual(['old', 'middle', 'recent'])
  })

  it('strongly deprioritizes recently completed activities with otherwise equal compatibility', () => {
    const result = getRecommendations(
      preferences,
      [createActivity('never-completed'), createActivity('recently-completed')],
      options({ completedActivities: [completion('recently-completed', '2026-09-07T12:00:00.000Z')] }),
    )

    expect(result.map((activity) => activity.id)).toEqual(['never-completed', 'recently-completed'])
  })

  it('keeps time as a hard constraint while allowing energy and budget mismatches to be scored', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('fits-time'),
        createActivity('different-energy-and-budget', { energy: 'high', budget: 'flexible' }),
        createActivity('too-long', { duration: '1-hour' }),
      ],
      options(),
    )

    expect(result.map((activity) => activity.id)).toEqual(['fits-time', 'different-energy-and-budget'])
  })

  it('never returns duplicate activity IDs in the same result set', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('one'),
        createActivity('one', { title: 'Duplicate ID' }),
        createActivity('two'),
        createActivity('three'),
      ],
      options(),
    )

    expect(new Set(result.map((activity) => activity.id)).size).toBe(result.length)
  })

  it('does not return cards that are currently visible when finding another activity', () => {
    const activityCatalog = [
      createActivity('one'),
      createActivity('two'),
      createActivity('three'),
      createActivity('replacement'),
    ]
    const visibleActivities = getRecommendations(preferences, activityCatalog, options())
    const replacement = getRecommendations(
      preferences,
      activityCatalog,
      options({ excludedActivityIds: new Set(visibleActivities.map((activity) => activity.id)) }),
    )

    expect(replacement.map((activity) => activity.id)).toEqual(['replacement'])
  })

  it('does not return no activities prematurely when older completed activities are available', () => {
    const activityCatalog = [createActivity('old-one'), createActivity('old-two'), createActivity('old-three')]
    const completedActivities = activityCatalog.map((activity) => completion(activity.id, '2026-08-30T12:00:00.000Z'))

    expect(getRecommendations(preferences, activityCatalog, options({ completedActivities }))).toHaveLength(3)
  })

  it('uses controlled randomness only to vary the order of similarly scored activities', () => {
    const randomValues = [0, 0.99, 0.5]
    const result = getRecommendations(
      preferences,
      [createActivity('one'), createActivity('two'), createActivity('three')],
      options({ randomizer: () => randomValues.shift() ?? 0 }),
    )

    expect(result.map((activity) => activity.id)).toEqual(['two', 'three', 'one'])
  })
})
