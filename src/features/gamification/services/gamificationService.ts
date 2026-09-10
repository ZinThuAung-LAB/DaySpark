import type { Achievement, DailyChallenge, UserStats } from '../../../types/gamification'
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from '../../../utils/local-storage'
import { updateStreakWithFreeze } from './streakService'

export const USER_STATS_STORAGE_KEY = 'dayspark.user-stats'

export const XP_PER_LEVEL = 100

/** The badges that can be earned from a user's persisted progress. */
export const achievements = [
  { id: 'first-step', title: 'First step', description: 'Complete your first activity.', icon: '★', condition: { type: 'activities', threshold: 1 } },
  { id: 'on-a-roll', title: 'On a roll', description: 'Keep a three-day streak.', icon: '🔥', condition: { type: 'streak', threshold: 3 } },
  { id: 'rising-star', title: 'Rising star', description: 'Earn 100 XP.', icon: '✦', condition: { type: 'xp', threshold: 100 } },
  { id: 'challenge-champion', title: 'Challenge champion', description: 'Complete three daily challenges.', icon: '🏆', condition: { type: 'challenges', threshold: 3 } },
] as const satisfies readonly Omit<Achievement, 'unlockedAt'>[]

const dailyChallengeTemplates = [
  {
    id: 'learn-something-new',
    title: 'Learn something new',
    description: 'Discover one fact, idea, or skill you did not know before today.',
    xpReward: 20,
  },
  {
    id: 'move-your-body',
    title: 'Move your body',
    description: 'Choose an activity that gets you moving for at least a few minutes.',
    xpReward: 20,
  },
  {
    id: 'make-a-connection',
    title: 'Make a connection',
    description: 'Reach out to someone or spend intentional time with another person.',
    xpReward: 20,
  },
  {
    id: 'create-a-small-win',
    title: 'Create a small win',
    description: 'Finish one meaningful task that makes your day feel a little better.',
    xpReward: 20,
  },
] as const satisfies readonly Omit<DailyChallenge, 'completedDate'>[]

export const initialUserStats: UserStats = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  bestStreak: 0,
  lastActivityDate: null,
  completedChallenges: [],
  streakFreezes: 0,
  streakFreezeMilestonesClaimed: 0,
}

export type AddXPResult = {
  stats: UserStats
  didLevelUp: boolean
}

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00`))
}

function isUserStats(value: unknown): value is UserStats {
  if (!value || typeof value !== 'object') {
    return false
  }

  const stats = value as Record<string, unknown>
  return (
    typeof stats.xp === 'number' &&
    Number.isFinite(stats.xp) &&
    typeof stats.level === 'number' &&
    Number.isFinite(stats.level) &&
    typeof stats.currentStreak === 'number' &&
    Number.isFinite(stats.currentStreak) &&
    typeof stats.bestStreak === 'number' &&
    Number.isFinite(stats.bestStreak) &&
    (stats.lastActivityDate === null || isDateKey(stats.lastActivityDate)) &&
    Array.isArray(stats.completedChallenges) &&
    stats.completedChallenges.every((challengeId) => typeof challengeId === 'string') &&
    (stats.streakFreezes === undefined || (typeof stats.streakFreezes === 'number' && Number.isFinite(stats.streakFreezes))) &&
    (stats.streakFreezeMilestonesClaimed === undefined || (typeof stats.streakFreezeMilestonesClaimed === 'number' && Number.isFinite(stats.streakFreezeMilestonesClaimed)))
  )
}

export function getCalendarDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function calculateLevel(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1
}

export function addXP(stats: UserStats, amount: number): AddXPResult {
  const xpToAdd = Number.isFinite(amount) ? Math.max(0, amount) : 0
  const xp = stats.xp + xpToAdd
  const level = calculateLevel(xp)

  return {
    stats: { ...stats, xp, level },
    didLevelUp: level > stats.level,
  }
}

/**
 * Derives earned badges from progress rather than persisting a second source of
 * truth. Callers may provide their completed activity count from history.
 */
export function getUnlockedAchievements(
  stats: UserStats,
  completedActivityCount: number,
  unlockedAt: string | null = null,
): Achievement[] {
  const progress = {
    activities: Math.max(0, completedActivityCount),
    challenges: stats.completedChallenges.length,
    streak: Math.max(stats.currentStreak, stats.bestStreak),
    xp: Math.max(0, stats.xp),
  }

  return achievements
    .filter((achievement) => progress[achievement.condition.type] >= achievement.condition.threshold)
    .map((achievement) => ({ ...achievement, unlockedAt }))
}

export function updateStreak(stats: UserStats, completedAt: Date = new Date()): UserStats {
  return updateStreakWithFreeze(stats, getCalendarDateKey(completedAt)).stats
}

export function getDailyChallenge(date: Date = new Date(), completedDate: string | null = null): DailyChallenge {
  const dateKey = getCalendarDateKey(date)
  const [year, month, day] = dateKey.split('-').map(Number)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
  const template = dailyChallengeTemplates[Math.abs(dayNumber) % dailyChallengeTemplates.length]

  return { ...template, id: `${template.id}-${dateKey}`, completedDate }
}

export function loadUserStats(): UserStats {
  try {
    const storedValue = readLocalStorage(USER_STATS_STORAGE_KEY)

    if (!storedValue) {
      return { ...initialUserStats, completedChallenges: [] }
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (!isUserStats(parsedValue)) {
      return { ...initialUserStats, completedChallenges: [] }
    }

    return {
      ...parsedValue,
      xp: Math.max(0, parsedValue.xp),
      level: calculateLevel(parsedValue.xp),
      currentStreak: Math.max(0, parsedValue.currentStreak),
      bestStreak: Math.max(0, parsedValue.bestStreak),
      completedChallenges: [...new Set(parsedValue.completedChallenges)],
      streakFreezes: Math.max(0, parsedValue.streakFreezes ?? 0),
      streakFreezeMilestonesClaimed: Math.max(0, parsedValue.streakFreezeMilestonesClaimed ?? 0),
    }
  } catch {
    return { ...initialUserStats, completedChallenges: [] }
  }
}

export function saveUserStats(stats: UserStats): UserStats {
  const normalizedStats: UserStats = {
    ...stats,
    xp: Math.max(0, stats.xp),
    level: calculateLevel(stats.xp),
    currentStreak: Math.max(0, stats.currentStreak),
    bestStreak: Math.max(stats.bestStreak, stats.currentStreak, 0),
    completedChallenges: [...new Set(stats.completedChallenges)],
    streakFreezes: Math.max(0, stats.streakFreezes),
    streakFreezeMilestonesClaimed: Math.max(0, stats.streakFreezeMilestonesClaimed),
  }

  writeLocalStorage(USER_STATS_STORAGE_KEY, JSON.stringify(normalizedStats))
  return normalizedStats
}

export function clearUserStats(): void {
  removeLocalStorage(USER_STATS_STORAGE_KEY)
}
