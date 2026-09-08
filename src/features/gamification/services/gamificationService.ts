import type { DailyChallenge, UserStats } from '../../../types/gamification'
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from '../../../utils/local-storage'

export const USER_STATS_STORAGE_KEY = 'dayspark.user-stats'

export const XP_PER_LEVEL = 100

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
    stats.completedChallenges.every((challengeId) => typeof challengeId === 'string')
  )
}

export function getCalendarDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calendarDayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
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

export function updateStreak(stats: UserStats, completedAt: Date = new Date()): UserStats {
  const completedDate = getCalendarDateKey(completedAt)

  if (stats.lastActivityDate === completedDate) {
    return stats
  }

  const previousDayNumber = stats.lastActivityDate ? calendarDayNumber(stats.lastActivityDate) : null
  const completedDayNumber = calendarDayNumber(completedDate)
  const currentStreak = previousDayNumber === completedDayNumber - 1 ? stats.currentStreak + 1 : 1

  return {
    ...stats,
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    lastActivityDate: completedDate,
  }
}

export function getDailyChallenge(date: Date = new Date(), completedDate: string | null = null): DailyChallenge {
  const dateKey = getCalendarDateKey(date)
  const template = dailyChallengeTemplates[Math.abs(calendarDayNumber(dateKey)) % dailyChallengeTemplates.length]

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
  }

  writeLocalStorage(USER_STATS_STORAGE_KEY, JSON.stringify(normalizedStats))
  return normalizedStats
}

export function clearUserStats(): void {
  removeLocalStorage(USER_STATS_STORAGE_KEY)
}
