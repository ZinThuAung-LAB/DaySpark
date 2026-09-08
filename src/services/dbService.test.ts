import { clearFavoriteActivityIds, saveFavoriteActivityId } from '../features/activityFavorites/favorite-activity-storage'
import { clearCompletedActivities, saveCompletedActivity } from '../features/activityHistory/completed-activity-storage'
import { clearUserStats, initialUserStats, saveUserStats } from '../features/gamification/services/gamificationService'
import type { UserCloudData } from './dbService'
import { getLocalUserData, mergeUserData, migrateLocalData, setActiveUser, syncActiveUserData, syncUserData } from './dbService'

const emptyData: UserCloudData = {
  profile: null,
  favorites: [],
  history: [],
  customActivities: [],
}

describe('dbService', () => {
  beforeEach(() => {
    clearFavoriteActivityIds()
    clearCompletedActivities()
    clearUserStats()
    setActiveUser(null)
  })

  it('merges local data without overwriting existing cloud collections', () => {
    const merged = mergeUserData(
      {
        profile: { ...initialUserStats, xp: 125, level: 2, completedChallenges: ['local-challenge'] },
        favorites: ['local-favorite'],
        history: [{ completionId: 'local', activityId: 'activity-1', activityTitle: 'Local activity', completedAt: '2026-09-08T00:00:00.000Z', xpReward: 10 }],
        customActivities: [],
      },
      {
        profile: { ...initialUserStats, xp: 75, level: 1, bestStreak: 3, completedChallenges: ['cloud-challenge'] },
        favorites: ['cloud-favorite'],
        history: [{ completionId: 'cloud', activityId: 'activity-2', activityTitle: 'Cloud activity', completedAt: '2026-09-07T00:00:00.000Z', xpReward: 20 }],
        customActivities: [],
      },
    )

    expect(merged.profile).toMatchObject({ xp: 125, level: 2, bestStreak: 3, completedChallenges: ['cloud-challenge', 'local-challenge'] })
    expect(merged.favorites).toEqual(['cloud-favorite', 'local-favorite'])
    expect(merged.history.map((activity) => activity.completionId)).toEqual(['cloud', 'local'])
  })

  it.skipIf(Boolean(import.meta.env.VITE_FIREBASE_API_KEY))('uses local data when Firebase is unconfigured or offline', async () => {
    saveFavoriteActivityId('five-minute-stretch')
    saveCompletedActivity({ completionId: 'completion-1', activityId: 'five-minute-stretch', activityTitle: 'Do a five-minute stretch', completedAt: '2026-09-08T00:00:00.000Z', xpReward: 10 })
    saveUserStats({ ...initialUserStats, xp: 10, level: 1 })

    await expect(syncUserData('user-1', emptyData)).resolves.toBeUndefined()
    await expect(syncActiveUserData({ favorites: ['five-minute-stretch'] })).resolves.toBeUndefined()
    await expect(migrateLocalData('user-1')).resolves.toEqual(getLocalUserData())
  })
})
