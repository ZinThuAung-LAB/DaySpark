import { useRef, useState } from 'react'
import type { CompletionSource, CompletedActivity } from './types'
import { loadCompletedActivities, saveCompletedActivity } from './completed-activity-storage'

function createCompletionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createCompletedActivity(activity: CompletionSource): CompletedActivity {
  return {
    completionId: createCompletionId(),
    activityId: activity.id,
    activityTitle: activity.title,
    completedAt: new Date().toISOString(),
    xpReward: activity.xpReward,
  }
}

export function useCompletedActivities() {
  const [completedActivities, setCompletedActivities] = useState(loadCompletedActivities)
  const completedActivityIds = useRef(new Set(completedActivities.map((activity) => activity.activityId)))
  const completionHistory = useRef(completedActivities)

  function completeActivity(activity: CompletionSource): CompletedActivity | null {
    if (completedActivityIds.current.has(activity.id)) {
      return null
    }

    const completedActivity = createCompletedActivity(activity)
    completedActivityIds.current.add(activity.id)
    const updatedHistory = saveCompletedActivity(completedActivity)
    completionHistory.current = updatedHistory
    setCompletedActivities(updatedHistory)

    return completedActivity
  }

  function getCompletion(activityId: string): CompletedActivity | undefined {
    return completedActivities.find((activity) => activity.activityId === activityId)
  }

  function getCompletionHistory(): CompletedActivity[] {
    return [...completionHistory.current]
  }

  return { completedActivities, completeActivity, getCompletion, getCompletionHistory }
}
