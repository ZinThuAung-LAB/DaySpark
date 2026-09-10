import { useEffect, useState } from 'react'
import {
  addXP,
  getCalendarDateKey,
  getDailyChallenge,
  loadUserStats,
  saveUserStats,
  XP_PER_LEVEL,
} from '../services/gamificationService'
import { updateStreakWithFreeze } from '../services/streakService'
import { syncActiveUserData } from '../../../services/dbService'
import { USER_DATA_CHANGED_EVENT } from '../../../services/userDataLifecycle'

type GamificationClock = () => Date

export function useGamification(getNow: GamificationClock = () => new Date(), userId: string | null = null) {
  const [stats, setStats] = useState(loadUserStats)
  const [lastXPReward, setLastXPReward] = useState<number | null>(null)
  const [didLevelUp, setDidLevelUp] = useState(false)
  const [didUseStreakFreeze, setDidUseStreakFreeze] = useState(false)
  useEffect(() => {
    const resetFromStorage = () => {
      setStats(loadUserStats())
      setLastXPReward(null)
      setDidLevelUp(false)
      setDidUseStreakFreeze(false)
    }
    window.addEventListener(USER_DATA_CHANGED_EVENT, resetFromStorage)
    return () => window.removeEventListener(USER_DATA_CHANGED_EVENT, resetFromStorage)
  }, [userId])
  const now = getNow()
  const dailyChallengeTemplate = getDailyChallenge(now)
  const isDailyChallengeCompleted = stats.completedChallenges.includes(dailyChallengeTemplate.id)
  const dailyChallenge = {
    ...dailyChallengeTemplate,
    completedDate: isDailyChallengeCompleted ? getCalendarDateKey(now) : null,
  }
  const progressPercentage = (stats.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100

  function saveUpdatedStats(nextStats: typeof stats, xpReward: number, leveledUp: boolean) {
    const savedStats = saveUserStats(nextStats)
    setStats(savedStats)
    void syncActiveUserData({ profile: savedStats })
    setLastXPReward(xpReward)
    setDidLevelUp(leveledUp)
  }

  function rewardXP(amount: number) {
    const result = addXP(stats, amount)
    saveUpdatedStats(result.stats, result.stats.xp - stats.xp, result.didLevelUp)
    return result
  }

  function completeActivity(xpReward: number) {
    const streakResult = updateStreakWithFreeze(stats, getCalendarDateKey(getNow()))
    const result = addXP(streakResult.stats, xpReward)
    saveUpdatedStats(result.stats, result.stats.xp - stats.xp, result.didLevelUp)
    setDidUseStreakFreeze(streakResult.usedStreakFreeze)
    return { ...result, usedStreakFreeze: streakResult.usedStreakFreeze }
  }

  function completeChallenge() {
    if (dailyChallenge.completedDate) {
      return null
    }

    const challengeCompletedStats = {
      ...stats,
      completedChallenges: [...stats.completedChallenges, dailyChallenge.id],
    }
    const result = addXP(challengeCompletedStats, dailyChallenge.xpReward)
    saveUpdatedStats(result.stats, result.stats.xp - stats.xp, result.didLevelUp)
    return result
  }

  return {
    xp: stats.xp,
    level: stats.level,
    xpIntoCurrentLevel: stats.xp % XP_PER_LEVEL,
    xpToNextLevel: XP_PER_LEVEL,
    progressPercentage,
    currentStreak: stats.currentStreak,
    dailyChallenge,
    isDailyChallengeCompleted,
    lastXPReward,
    didLevelUp,
    didUseStreakFreeze,
    streakFreezes: stats.streakFreezes,
    rewardXP,
    completeActivity,
    completeChallenge,
  }
}
