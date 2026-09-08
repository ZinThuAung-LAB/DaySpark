import {
  clearFavoriteActivityIds,
  FAVORITE_ACTIVITY_IDS_STORAGE_KEY,
  loadFavoriteActivityIds,
  removeFavoriteActivityId,
  saveFavoriteActivityId,
} from './favorite-activity-storage'

describe('favorite activity storage', () => {
  beforeEach(() => {
    clearFavoriteActivityIds()
  })

  it('saves and loads favorite activity IDs', () => {
    saveFavoriteActivityId('activity-1')
    saveFavoriteActivityId('activity-2')

    expect(loadFavoriteActivityIds()).toEqual(['activity-1', 'activity-2'])
  })

  it('prevents duplicate favorite activity IDs', () => {
    saveFavoriteActivityId('activity-1')
    saveFavoriteActivityId('activity-1')

    expect(loadFavoriteActivityIds()).toEqual(['activity-1'])
  })

  it('removes a favorite activity ID', () => {
    saveFavoriteActivityId('activity-1')
    saveFavoriteActivityId('activity-2')

    expect(removeFavoriteActivityId('activity-1')).toEqual(['activity-2'])
    expect(loadFavoriteActivityIds()).toEqual(['activity-2'])
  })

  it('loads valid unique IDs from persisted storage', () => {
    window.localStorage.setItem(FAVORITE_ACTIVITY_IDS_STORAGE_KEY, JSON.stringify(['activity-1', 'activity-1', 5, 'activity-2']))

    expect(loadFavoriteActivityIds()).toEqual(['activity-1', 'activity-2'])
  })
})
