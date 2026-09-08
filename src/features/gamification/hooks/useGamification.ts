import { useState } from 'react'
import {
  addXP,
  getCalendarDateKey,
  getDailyChallenge,
  loadUserStats,
  saveUserStats,
  updateStreak,
  XP_PER_LEVEL,
} from '../services/gamificationService'

type GamificationClock = () => Date

export function useGamification(getNow: GamificationClock = () => new Date()) {
  const [stats, setStats] = useState(loadUserStats)
  const [lastXPReward, setLastXPReward] = useState<number | null>(null)
  const [didLevelUp, setDidLevelUp] = useState(false)
  const now = getNow()
  const dailyChallengeTemplate = getDailyChallenge(now)
  const isDailyChallengeCompleted = stats.completedChallenges.includes(dailyChallengeTemplate.id)
  const dailyChallenge = {
    ...dailyChallengeTemplate,
    completedDate: isDailyChallengeCompleted ? getCalendarDateKey(now) : null,
  }
  const progressPercentage = (stats.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100

  function saveUpdatedStats(nextStats: typeof stats, xpReward: number, leveledUp: boolean) {
    setStats(saveUserStats(nextStats))
    setLastXPReward(xpReward)
    setDidLevelUp(leveledUp)
  }

  function rewardXP(amount: number) {
    const result = addXP(stats, amount)
    saveUpdatedStats(result.stats, result.stats.xp - stats.xp, result.didLevelUp)
    return result
  }

  function completeActivity(xpReward: number) {
    const streakUpdatedStats = updateStreak(stats, getNow())
    const result = addXP(streakUpdatedStats, xpReward)
    saveUpdatedStats(result.stats, result.stats.xp - stats.xp, result.didLevelUp)
    return result
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
    rewardXP,
    completeActivity,
    completeChallenge,
  }
}
