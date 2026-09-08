import { useEffect, useRef, useState } from 'react'
import type { CompletionSource, CompletedActivity } from './types'
import { loadCompletedActivities, saveCompletedActivity } from './completed-activity-storage'
import { syncActiveUserData } from '../../services/dbService'
import { USER_DATA_CHANGED_EVENT } from '../../services/userDataLifecycle'

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

export function useCompletedActivities(userId: string | null = null) {
  const [completedActivities, setCompletedActivities] = useState(loadCompletedActivities)
  const completedActivityIds = useRef(new Set(completedActivities.map((activity) => activity.activityId)))
  const completionHistory = useRef(completedActivities)
  useEffect(() => {
    const resetFromStorage = () => {
      const nextActivities = loadCompletedActivities()
      completedActivityIds.current = new Set(nextActivities.map((activity) => activity.activityId))
      completionHistory.current = nextActivities
      setCompletedActivities(nextActivities)
    }
    window.addEventListener(USER_DATA_CHANGED_EVENT, resetFromStorage)
    return () => window.removeEventListener(USER_DATA_CHANGED_EVENT, resetFromStorage)
  }, [userId])

  function completeActivity(activity: CompletionSource): CompletedActivity | null {
    if (completedActivityIds.current.has(activity.id)) {
      return null
    }

    const completedActivity = createCompletedActivity(activity)
    completedActivityIds.current.add(activity.id)
    const updatedHistory = saveCompletedActivity(completedActivity)
    completionHistory.current = updatedHistory
    setCompletedActivities(updatedHistory)
    void syncActiveUserData({ history: updatedHistory })

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
