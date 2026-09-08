import type { Activity } from '../../types/activity'

export type CompletedActivity = {
  completionId: string
  activityId: string
  activityTitle: string
  completedAt: string
  xpReward: number
}

export type CompletionSource = Pick<Activity, 'id' | 'title' | 'xpReward'>
