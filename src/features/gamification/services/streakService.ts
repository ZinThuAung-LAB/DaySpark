import type { UserStats } from '../../../types/gamification'

export const STREAK_FREEZE_XP_COST = 100

type StreakUpdate = {
  stats: UserStats
  usedStreakFreeze: boolean
}

function calendarDayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
}

function applyEarnedFreezes(stats: UserStats, resetMilestones = false): UserStats {
  const claimed = resetMilestones ? 0 : stats.streakFreezeMilestonesClaimed
  const availableMilestones = Math.floor(stats.currentStreak / 7)
  const earned = Math.max(0, availableMilestones - claimed)
  return { ...stats, streakFreezes: stats.streakFreezes + earned, streakFreezeMilestonesClaimed: availableMilestones }
}

/** Updates a calendar streak and automatically spends one freeze for exactly one missed day. */
export function updateStreakWithFreeze(stats: UserStats, completedDate: string): StreakUpdate {
  if (stats.lastActivityDate === completedDate) return { stats, usedStreakFreeze: false }

  const previousDay = stats.lastActivityDate ? calendarDayNumber(stats.lastActivityDate) : null
  const currentDay = calendarDayNumber(completedDate)
  const elapsedDays = previousDay === null ? null : currentDay - previousDay

  if (elapsedDays === 1) {
    const next = { ...stats, currentStreak: stats.currentStreak + 1, bestStreak: Math.max(stats.bestStreak, stats.currentStreak + 1), lastActivityDate: completedDate }
    return { stats: applyEarnedFreezes(next), usedStreakFreeze: false }
  }

  if (elapsedDays === 2 && stats.streakFreezes > 0) {
    const next = { ...stats, currentStreak: stats.currentStreak + 1, bestStreak: Math.max(stats.bestStreak, stats.currentStreak + 1), lastActivityDate: completedDate, streakFreezes: stats.streakFreezes - 1 }
    return { stats: applyEarnedFreezes(next), usedStreakFreeze: true }
  }

  const next = { ...stats, currentStreak: 1, lastActivityDate: completedDate }
  return { stats: applyEarnedFreezes(next, true), usedStreakFreeze: false }
}

export function unlockStreakFreezeWithXP(stats: UserStats): UserStats | null {
  if (stats.xp < STREAK_FREEZE_XP_COST) return null
  return { ...stats, xp: stats.xp - STREAK_FREEZE_XP_COST, streakFreezes: stats.streakFreezes + 1 }
}
