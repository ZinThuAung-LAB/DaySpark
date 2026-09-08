import { useEffect, useState } from 'react'
import {
  loadFavoriteActivityIds,
  removeFavoriteActivityId,
  saveFavoriteActivityId,
} from './favorite-activity-storage'
import { syncActiveUserData } from '../../services/dbService'
import { USER_DATA_CHANGED_EVENT } from '../../services/userDataLifecycle'

export function useFavoriteActivities(userId: string | null = null) {
  const [favoriteActivityIds, setFavoriteActivityIds] = useState(loadFavoriteActivityIds)
  useEffect(() => {
    const resetFromStorage = () => setFavoriteActivityIds(loadFavoriteActivityIds())
    window.addEventListener(USER_DATA_CHANGED_EVENT, resetFromStorage)
    return () => window.removeEventListener(USER_DATA_CHANGED_EVENT, resetFromStorage)
  }, [userId])

  function favoriteActivity(activityId: string): void {
    if (favoriteActivityIds.includes(activityId)) {
      return
    }

    const updatedFavoriteActivityIds = saveFavoriteActivityId(activityId)
    setFavoriteActivityIds(updatedFavoriteActivityIds)
    void syncActiveUserData({ favorites: updatedFavoriteActivityIds })
  }

  function unfavoriteActivity(activityId: string): void {
    const updatedFavoriteActivityIds = removeFavoriteActivityId(activityId)
    setFavoriteActivityIds(updatedFavoriteActivityIds)
    void syncActiveUserData({ favorites: updatedFavoriteActivityIds })
  }

  function isFavorite(activityId: string): boolean {
    return favoriteActivityIds.includes(activityId)
  }

  return { favoriteActivityIds, favoriteActivity, unfavoriteActivity, isFavorite }
}
