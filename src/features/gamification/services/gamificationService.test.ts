import type { UserStats } from '../../../types/gamification'
import {
  addXP,
  calculateLevel,
  clearUserStats,
  getDailyChallenge,
  initialUserStats,
  loadUserStats,
  saveUserStats,
  updateStreak,
  USER_STATS_STORAGE_KEY,
} from './gamificationService'

function createStats(overrides: Partial<UserStats> = {}): UserStats {
  return { ...initialUserStats, completedChallenges: [], ...overrides }
}

describe('gamification service', () => {
  beforeEach(() => {
    clearUserStats()
  })

  it('adds XP and reports level-ups using 100 XP levels', () => {
    const result = addXP(createStats({ xp: 90, level: 1 }), 15)

    expect(calculateLevel(0)).toBe(1)
    expect(calculateLevel(100)).toBe(2)
    expect(result.stats).toMatchObject({ xp: 105, level: 2 })
    expect(result.didLevelUp).toBe(true)
  })

  it('increments a streak for a consecutive day and keeps it unchanged for the same day', () => {
    const consecutiveStats = updateStreak(createStats({ currentStreak: 3, bestStreak: 3, lastActivityDate: '2026-09-07' }), new Date('2026-09-08T12:00:00'))
    const sameDayStats = updateStreak(consecutiveStats, new Date('2026-09-08T18:00:00'))

    expect(consecutiveStats).toMatchObject({ currentStreak: 4, bestStreak: 4, lastActivityDate: '2026-09-08' })
    expect(sameDayStats).toBe(consecutiveStats)
  })

  it('resets a streak after a missed day', () => {
    const stats = updateStreak(
      createStats({ currentStreak: 5, bestStreak: 5, lastActivityDate: '2026-09-05' }),
      new Date('2026-09-08T12:00:00'),
    )

    expect(stats).toMatchObject({ currentStreak: 1, bestStreak: 5, lastActivityDate: '2026-09-08' })
  })

  it('selects the same daily challenge for the same calendar date', () => {
    const firstChallenge = getDailyChallenge(new Date('2026-09-08T08:00:00'))
    const repeatedChallenge = getDailyChallenge(new Date('2026-09-08T20:00:00'))

    expect(repeatedChallenge).toEqual(firstChallenge)
    expect(firstChallenge.completedDate).toBeNull()
  })

  it('persists, rehydrates, and normalizes user stats', () => {
    saveUserStats(createStats({ xp: 205, level: 1, currentStreak: 2, bestStreak: 1, completedChallenges: ['challenge-1', 'challenge-1'] }))

    expect(loadUserStats()).toEqual({
      xp: 205,
      level: 3,
      currentStreak: 2,
      bestStreak: 2,
      lastActivityDate: null,
      completedChallenges: ['challenge-1'],
    })
  })

  it('returns initial stats when persisted data is invalid', () => {
    window.localStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify({ xp: 'not-a-number' }))

    expect(loadUserStats()).toEqual(initialUserStats)
  })
})
