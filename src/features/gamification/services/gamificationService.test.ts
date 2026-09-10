import type { UserStats } from '../../../types/gamification'
import {
  addXP,
  calculateLevel,
  clearUserStats,
  getDailyChallenge,
  getUnlockedAchievements,
  initialUserStats,
  loadUserStats,
  saveUserStats,
  updateStreak,
  USER_STATS_STORAGE_KEY,
} from './gamificationService'
import { STREAK_FREEZE_XP_COST, unlockStreakFreezeWithXP, updateStreakWithFreeze } from './streakService'

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

  it('uses a Streak Freeze for exactly one missed calendar day', () => {
    const saved = updateStreakWithFreeze(
      createStats({ currentStreak: 6, bestStreak: 6, lastActivityDate: '2026-09-05', streakFreezes: 1 }),
      '2026-09-07',
    )
    const reset = updateStreakWithFreeze(
      createStats({ currentStreak: 6, bestStreak: 6, lastActivityDate: '2026-09-05', streakFreezes: 1 }),
      '2026-09-08',
    )

    expect(saved).toMatchObject({ usedStreakFreeze: true, stats: { currentStreak: 7, bestStreak: 7, streakFreezes: 1 } })
    expect(reset).toMatchObject({ usedStreakFreeze: false, stats: { currentStreak: 1, bestStreak: 6, streakFreezes: 1 } })
  })

  it('awards free freezes at seven-day milestones and supports XP unlocks', () => {
    const earned = updateStreakWithFreeze(createStats({ currentStreak: 6, bestStreak: 6, lastActivityDate: '2026-09-06' }), '2026-09-07')
    const unlocked = unlockStreakFreezeWithXP(createStats({ xp: STREAK_FREEZE_XP_COST }))

    expect(earned.stats).toMatchObject({ currentStreak: 7, streakFreezes: 1, streakFreezeMilestonesClaimed: 1 })
    expect(unlocked).toMatchObject({ xp: 0, streakFreezes: 1 })
    expect(unlockStreakFreezeWithXP(createStats({ xp: STREAK_FREEZE_XP_COST - 1 }))).toBeNull()
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
      streakFreezes: 0,
      streakFreezeMilestonesClaimed: 0,
    })
  })

  it('returns initial stats when persisted data is invalid', () => {
    window.localStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify({ xp: 'not-a-number' }))

    expect(loadUserStats()).toEqual(initialUserStats)
  })

  it('unlocks badges only when their activity, streak, XP, or challenge threshold is met', () => {
    const stats = createStats({ xp: 100, currentStreak: 1, bestStreak: 3, completedChallenges: ['one', 'two', 'three'] })

    expect(getUnlockedAchievements(stats, 1, '2026-09-10T00:00:00.000Z')).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'first-step', unlockedAt: '2026-09-10T00:00:00.000Z' }),
      expect.objectContaining({ id: 'on-a-roll' }),
      expect.objectContaining({ id: 'rising-star' }),
      expect.objectContaining({ id: 'challenge-champion' }),
    ]))
    expect(getUnlockedAchievements(createStats({ xp: 99, currentStreak: 2, bestStreak: 2, completedChallenges: ['one', 'two'] }), 0)).toEqual([])
  })
})
