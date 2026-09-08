import type { Activity } from '../../types/activity'
import type { CompletePreferences } from '../../types/preferences'
import { getRecommendations } from './recommendation-engine'

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

const noRandomness = () => 0

describe('getRecommendations', () => {
  it('returns the three highest-scoring perfect matches', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('perfect-one'),
        createActivity('perfect-two'),
        createActivity('perfect-three'),
        createActivity('fallback', { moods: ['bored'] }),
      ],
      noRandomness,
    )

    expect(result.map((activity) => activity.id)).toEqual(['perfect-one', 'perfect-two', 'perfect-three'])
  })

  it('returns the available unique activities when fewer than three are compatible', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('only-match'),
        createActivity('only-match', { title: 'Duplicate ID' }),
        createActivity('too-expensive', { budget: 'flexible' }),
      ],
      noRandomness,
    )

    expect(result.map((activity) => activity.id)).toEqual(['only-match'])
  })

  it('filters activities that exceed the available time', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('fits-in-time'),
        createActivity('quick-task', { duration: '10-minutes' }),
        createActivity('takes-too-long', { duration: '1-hour' }),
      ],
      noRandomness,
    )

    expect(result.map((activity) => activity.id)).toEqual(['fits-in-time', 'quick-task'])
  })

  it('filters activities outside the selected budget', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('low-cost'),
        createActivity('free', { budget: 'free' }),
        createActivity('too-expensive', { budget: 'flexible' }),
      ],
      noRandomness,
    )

    expect(result.map((activity) => activity.id)).toEqual(['low-cost', 'free'])
  })

  it('filters activities requiring more energy than is available', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('medium-energy'),
        createActivity('low-energy', { energy: 'low' }),
        createActivity('high-energy', { energy: 'high' }),
      ],
      noRandomness,
    )

    expect(result.map((activity) => activity.id)).toEqual(['medium-energy', 'low-energy'])
  })

  it('falls back to compatible activities with other moods after mood matches', () => {
    const result = getRecommendations(
      preferences,
      [
        createActivity('mood-match'),
        createActivity('fallback-one', { moods: ['bored'] }),
        createActivity('fallback-two', { moods: ['relaxed'] }),
        createActivity('fallback-three', { moods: ['social'] }),
      ],
      noRandomness,
    )

    expect(result.map((activity) => activity.id)).toEqual(['mood-match', 'fallback-one', 'fallback-two'])
  })
})
