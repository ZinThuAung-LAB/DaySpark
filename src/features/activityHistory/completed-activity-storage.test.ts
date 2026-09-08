import type { CompletedActivity } from './types'
import {
  clearCompletedActivities,
  COMPLETED_ACTIVITIES_STORAGE_KEY,
  loadCompletedActivities,
  saveCompletedActivity,
} from './completed-activity-storage'

const firstCompletion: CompletedActivity = {
  completionId: 'completion-1',
  activityId: 'activity-1',
  activityTitle: 'First activity',
  completedAt: '2026-09-01T08:00:00.000Z',
  xpReward: 20,
}

describe('completed activity storage', () => {
  beforeEach(() => {
    clearCompletedActivities()
  })

  it('saves and loads completed activities in newest-first order', () => {
    const newerCompletion: CompletedActivity = {
      ...firstCompletion,
      completionId: 'completion-2',
      activityId: 'activity-2',
      completedAt: '2026-09-02T08:00:00.000Z',
    }

    saveCompletedActivity(firstCompletion)
    saveCompletedActivity(newerCompletion)

    expect(loadCompletedActivities()).toEqual([newerCompletion, firstCompletion])
  })

  it('does not save the same completion record twice', () => {
    saveCompletedActivity(firstCompletion)
    saveCompletedActivity(firstCompletion)

    expect(loadCompletedActivities()).toEqual([firstCompletion])
  })

  it('ignores invalid records from persisted storage', () => {
    window.localStorage.setItem(
      COMPLETED_ACTIVITIES_STORAGE_KEY,
      JSON.stringify([firstCompletion, { activityId: 'missing-fields' }, { ...firstCompletion, completionId: '' }]),
    )

    expect(loadCompletedActivities()).toEqual([firstCompletion])
  })
})
