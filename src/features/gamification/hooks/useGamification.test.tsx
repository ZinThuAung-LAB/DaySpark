import { act, renderHook } from '@testing-library/react'
import { clearUserStats, loadUserStats } from '../services/gamificationService'
import { useGamification } from './useGamification'

const getNow = () => new Date('2026-09-08T12:00:00')

describe('useGamification', () => {
  beforeEach(() => {
    clearUserStats()
  })

  it('updates XP, level progress, and streak after an activity completion', () => {
    const { result } = renderHook(() => useGamification(getNow))

    act(() => {
      result.current.completeActivity(125)
    })

    expect(result.current.xp).toBe(125)
    expect(result.current.level).toBe(2)
    expect(result.current.progressPercentage).toBe(25)
    expect(result.current.currentStreak).toBe(1)
    expect(result.current.lastXPReward).toBe(125)
    expect(loadUserStats()).toMatchObject({ xp: 125, currentStreak: 1, lastActivityDate: '2026-09-08' })
  })

  it('completes today\'s daily challenge once and awards its XP', () => {
    const { result } = renderHook(() => useGamification(getNow))
    const challengeXP = result.current.dailyChallenge.xpReward

    act(() => {
      result.current.completeChallenge()
    })

    expect(result.current.isDailyChallengeCompleted).toBe(true)
    expect(result.current.dailyChallenge.completedDate).toBe('2026-09-08')
    expect(result.current.xp).toBe(challengeXP)

    act(() => {
      result.current.completeChallenge()
    })

    expect(result.current.xp).toBe(challengeXP)
  })
})
