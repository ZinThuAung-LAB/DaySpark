import type { AvailableTime, Budget, EnergyLevel, Mood } from './preferences'

export type ActivityCategory =
  | 'entertainment'
  | 'learning'
  | 'fitness'
  | 'outdoor'
  | 'social'
  | 'creativity'
  | 'relaxation'
  | 'productivity'

export type Activity = {
  id: string
  title: string
  description: string
  moods: readonly Mood[]
  energy: EnergyLevel
  duration: AvailableTime
  budget: Budget
  category: ActivityCategory
  xpReward: number
}
