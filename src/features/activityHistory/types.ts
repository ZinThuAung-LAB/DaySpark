import type { Activity } from '../../types/activity'
import type { Mood } from '../../types/preferences'

export type CompletedActivity = {
  completionId: string
  activityId: string
  activityTitle: string
  completedAt: string
  mood?: Mood
  xpReward: number
}

export type CompletionSource = Pick<Activity, 'id' | 'title' | 'xpReward'>
