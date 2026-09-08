export type UserStats = {
  xp: number
  level: number
  currentStreak: number
  bestStreak: number
  lastActivityDate: string | null
  completedChallenges: string[]
}

export type DailyChallenge = {
  id: string
  title: string
  description: string
  xpReward: number
  completedDate: string | null
}

export type AchievementConditionType = 'activities' | 'challenges' | 'streak' | 'xp'

export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string | null
  condition: {
    type: AchievementConditionType
    threshold: number
  }
}
