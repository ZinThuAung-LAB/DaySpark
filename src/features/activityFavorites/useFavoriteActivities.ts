import { useState } from 'react'
import {
  loadFavoriteActivityIds,
  removeFavoriteActivityId,
  saveFavoriteActivityId,
} from './favorite-activity-storage'

export function useFavoriteActivities() {
  const [favoriteActivityIds, setFavoriteActivityIds] = useState(loadFavoriteActivityIds)

  function favoriteActivity(activityId: string): void {
    if (favoriteActivityIds.includes(activityId)) {
      return
    }

    setFavoriteActivityIds(saveFavoriteActivityId(activityId))
  }

  function unfavoriteActivity(activityId: string): void {
    setFavoriteActivityIds(removeFavoriteActivityId(activityId))
  }

  function isFavorite(activityId: string): boolean {
    return favoriteActivityIds.includes(activityId)
  }

  return { favoriteActivityIds, favoriteActivity, unfavoriteActivity, isFavorite }
}
