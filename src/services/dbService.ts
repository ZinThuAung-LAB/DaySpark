import { getApp, getApps, initializeApp } from 'firebase/app'
import { deleteDoc, doc, getDoc, getFirestore, setDoc, type Firestore } from 'firebase/firestore'
import type { Activity } from '../types/activity'
import type { UserStats } from '../types/gamification'
import { clearFavoriteActivityIds, loadFavoriteActivityIds, saveFavoriteActivityId } from '../features/activityFavorites/favorite-activity-storage'
import { clearCompletedActivities, loadCompletedActivities, saveCompletedActivity } from '../features/activityHistory/completed-activity-storage'
import type { CompletedActivity } from '../features/activityHistory/types'
import { clearUserStats, loadUserStats, saveUserStats } from '../features/gamification/services/gamificationService'

export type UserCloudData = {
  profile: UserStats | null
  favorites: string[]
  history: CompletedActivity[]
  customActivities: Activity[]
}

export type UserDataUpdate = Partial<UserCloudData>

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let activeUserId: string | null = null
const FIRESTORE_TIMEOUT_MS = 10_000

function withFirestoreTimeout<T>(operation: Promise<T>): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore request timed out.')), FIRESTORE_TIMEOUT_MS)
    }),
  ])
}

function isUserStats(value: unknown): value is UserStats {
  if (!value || typeof value !== 'object') return false
  const stats = value as Record<string, unknown>
  return typeof stats.xp === 'number' && typeof stats.level === 'number'
    && typeof stats.currentStreak === 'number' && typeof stats.bestStreak === 'number'
    && (stats.lastActivityDate === null || typeof stats.lastActivityDate === 'string')
    && Array.isArray(stats.completedChallenges)
    && stats.completedChallenges.every((challenge) => typeof challenge === 'string')
}

function isCompletedActivity(value: unknown): value is CompletedActivity {
  if (!value || typeof value !== 'object') return false
  const activity = value as Record<string, unknown>
  return typeof activity.completionId === 'string' && typeof activity.activityId === 'string'
    && typeof activity.activityTitle === 'string' && typeof activity.completedAt === 'string'
    && typeof activity.xpReward === 'number'
}

function isActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') return false
  const activity = value as Record<string, unknown>
  return typeof activity.id === 'string' && typeof activity.title === 'string'
}

function getDatabase(): Firestore | null {
  if (!Object.values(firebaseConfig).every(Boolean)) {
    return null
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  return getFirestore(app)
}

function userDocument(database: Firestore, uid: string, collection: 'profile' | 'favorites' | 'history' | 'customActivities') {
  return doc(database, 'users', uid, collection, 'data')
}

function uniqueBy<T>(items: readonly T[], getKey: (item: T) => string): T[] {
  const uniqueItems = new Map<string, T>()

  items.forEach((item) => uniqueItems.set(getKey(item), item))
  return [...uniqueItems.values()]
}

export function mergeUserData(localData: UserCloudData, cloudData: UserCloudData): UserCloudData {
  const localStats = localData.profile
  const cloudStats = cloudData.profile
  const profile = localStats || cloudStats
    ? {
        ...(cloudStats ?? localStats),
        ...(localStats ?? cloudStats),
        xp: Math.max(localStats?.xp ?? 0, cloudStats?.xp ?? 0),
        level: Math.max(localStats?.level ?? 1, cloudStats?.level ?? 1),
        currentStreak: Math.max(localStats?.currentStreak ?? 0, cloudStats?.currentStreak ?? 0),
        bestStreak: Math.max(localStats?.bestStreak ?? 0, cloudStats?.bestStreak ?? 0),
        lastActivityDate: [localStats?.lastActivityDate, cloudStats?.lastActivityDate].filter(Boolean).sort().at(-1) ?? null,
        completedChallenges: [...new Set([...(cloudStats?.completedChallenges ?? []), ...(localStats?.completedChallenges ?? [])])],
      }
    : null

  return {
    profile,
    favorites: [...new Set([...cloudData.favorites, ...localData.favorites])],
    history: uniqueBy([...cloudData.history, ...localData.history], (activity) => activity.completionId),
    customActivities: uniqueBy([...cloudData.customActivities, ...localData.customActivities], (activity) => activity.id),
  }
}

export function getLocalUserData(): UserCloudData {
  return {
    profile: loadUserStats(),
    favorites: loadFavoriteActivityIds(),
    history: loadCompletedActivities(),
    customActivities: [],
  }
}

export function persistLocalUserData(data: UserCloudData): void {
  clearUserStats()
  clearFavoriteActivityIds()
  clearCompletedActivities()
  if (data.profile) saveUserStats(data.profile)
  data.favorites.forEach((activityId) => saveFavoriteActivityId(activityId))
  data.history.forEach((activity) => saveCompletedActivity(activity))
}

export function setActiveUser(uid: string | null): void {
  activeUserId = uid
}

export async function syncUserData(uid: string, data: UserDataUpdate): Promise<void> {
  const database = getDatabase()

  if (!database) {
    return
  }

  const writes: Promise<void>[] = []
  if (data.profile) writes.push(setDoc(userDocument(database, uid, 'profile'), data.profile, { merge: true }))
  if (data.favorites) writes.push(setDoc(userDocument(database, uid, 'favorites'), { activityIds: [...new Set(data.favorites)] }, { merge: true }))
  if (data.history) writes.push(setDoc(userDocument(database, uid, 'history'), { activities: data.history }, { merge: true }))
  if (data.customActivities) writes.push(setDoc(userDocument(database, uid, 'customActivities'), { activities: data.customActivities }, { merge: true }))
  await withFirestoreTimeout(Promise.all(writes))
}

export async function fetchUserData(uid: string): Promise<UserCloudData | null> {
  const database = getDatabase()

  if (!database) {
    return null
  }

  const [profile, favorites, history, customActivities] = await withFirestoreTimeout(Promise.all([
    getDoc(userDocument(database, uid, 'profile')),
    getDoc(userDocument(database, uid, 'favorites')),
    getDoc(userDocument(database, uid, 'history')),
    getDoc(userDocument(database, uid, 'customActivities')),
  ]))

  const profileData = profile.data()
  const favoritesData = favorites.data()
  const historyData = history.data()
  const customActivitiesData = customActivities.data()

  return {
    profile: profile.exists() && isUserStats(profileData) ? profileData : null,
    favorites: Array.isArray(favoritesData?.activityIds) ? favoritesData.activityIds.filter((id): id is string => typeof id === 'string') : [],
    history: Array.isArray(historyData?.activities) ? historyData.activities.filter(isCompletedActivity) : [],
    customActivities: Array.isArray(customActivitiesData?.activities) ? customActivitiesData.activities.filter(isActivity) : [],
  }
}

export async function saveUserActivity(uid: string, activityRecord: CompletedActivity): Promise<void> {
  const cloudData = await fetchUserData(uid)
  await syncUserData(uid, { history: uniqueBy([...(cloudData?.history ?? []), activityRecord], (activity) => activity.completionId) })
}

export async function saveUserFavorite(uid: string, activityId: string): Promise<void> {
  const cloudData = await fetchUserData(uid)
  await syncUserData(uid, { favorites: [...new Set([...(cloudData?.favorites ?? []), activityId])] })
}

export async function saveCustomActivity(uid: string, activity: Activity): Promise<void> {
  const cloudData = await fetchUserData(uid)
  await syncUserData(uid, { customActivities: uniqueBy([...(cloudData?.customActivities ?? []), activity], (item) => item.id) })
}

export async function deleteUserData(uid: string): Promise<void> {
  const database = getDatabase()

  if (!database) {
    return
  }

  await withFirestoreTimeout(Promise.all([
    deleteDoc(userDocument(database, uid, 'profile')),
    deleteDoc(userDocument(database, uid, 'favorites')),
    deleteDoc(userDocument(database, uid, 'history')),
    deleteDoc(userDocument(database, uid, 'customActivities')),
  ]))
}

export async function syncActiveUserData(data: UserDataUpdate): Promise<void> {
  if (activeUserId) {
    try {
      await syncUserData(activeUserId, data)
    } catch {
      // Local persistence remains the source of truth until connectivity returns.
    }
  }
}

export async function migrateLocalData(uid: string): Promise<UserCloudData> {
  const localData = getLocalUserData()

  try {
    const cloudData = await fetchUserData(uid)
    const mergedData = mergeUserData(localData, cloudData ?? { profile: null, favorites: [], history: [], customActivities: [] })
    persistLocalUserData(mergedData)
    await syncUserData(uid, mergedData)
    return mergedData
  } catch {
    return localData
  }
}
