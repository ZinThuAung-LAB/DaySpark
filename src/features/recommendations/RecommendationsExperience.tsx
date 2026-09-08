import { useState } from 'react'
import { RecommendationResults } from '../../components/RecommendationResults'
import { activities } from '../../data/activities'
import { FavoriteActivities } from '../activityFavorites/FavoriteActivities'
import { useFavoriteActivities } from '../activityFavorites/useFavoriteActivities'
import { RecentCompletions } from '../activityHistory/RecentCompletions'
import { useCompletedActivities } from '../activityHistory/useCompletedActivities'
import type { Activity } from '../../types/activity'
import type { CompletePreferences } from '../../types/preferences'
import { RecommendationForm } from './RecommendationForm'
import { getRecommendations } from './recommendation-engine'

export function RecommendationsExperience() {
  const [preferences, setPreferences] = useState<CompletePreferences | null>(null)
  const [recommendations, setRecommendations] = useState<Activity[]>([])
  const { completedActivities, completeActivity, getCompletion, getCompletionHistory } = useCompletedActivities()
  const { favoriteActivityIds, favoriteActivity, unfavoriteActivity, isFavorite } = useFavoriteActivities()
  const [message, setMessage] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  function handleSuggest(nextPreferences: CompletePreferences) {
    const nextRecommendations = getRecommendations(
      nextPreferences,
      activities,
      { completedActivities: getCompletionHistory() },
    )

    setPreferences(nextPreferences)
    setRecommendations(nextRecommendations)
    setMessage(
      nextRecommendations.length === 0
        ? 'No activities fit within your available time. Try choosing more time.'
        : nextRecommendations.length < 3
          ? `Only ${nextRecommendations.length} activities fit within your available time.`
          : null,
    )
    setHasSearched(true)
  }

  function handleDoThis(activityId: string) {
    const activity = activities.find((currentActivity) => currentActivity.id === activityId)

    if (activity) {
      completeActivity(activity)
    }
  }

  function handleToggleFavorite(activityId: string) {
    if (isFavorite(activityId)) {
      unfavoriteActivity(activityId)
      return
    }

    favoriteActivity(activityId)
  }

  function handleTryAnother(activityId: string) {
    if (!preferences) {
      return
    }

    const excludedActivityIds = new Set(recommendations.map((activity) => activity.id))
    const replacement = getRecommendations(preferences, activities, {
      completedActivities: getCompletionHistory(),
      excludedActivityIds,
    })[0]

    if (!replacement) {
      setMessage('No other activities fit within your available time right now.')
      return
    }

    setRecommendations((currentActivities) =>
      currentActivities.map((activity) => (activity.id === activityId ? replacement : activity)),
    )
    setMessage('Here is another compatible activity.')
  }

  return (
    <>
      <RecommendationForm onSuggest={handleSuggest} />
      {hasSearched && (
        <RecommendationResults
          activities={recommendations}
          emptyMessage={message}
          isFavorite={isFavorite}
          message={message}
          onDoThis={handleDoThis}
          onToggleFavorite={handleToggleFavorite}
          onTryAnother={handleTryAnother}
          getCompletion={getCompletion}
        />
      )}
      <RecentCompletions completedActivities={completedActivities} />
      <FavoriteActivities
        activities={activities}
        favoriteActivityIds={favoriteActivityIds}
        getCompletion={getCompletion}
        onDoThis={handleDoThis}
        onUnfavorite={unfavoriteActivity}
      />
    </>
  )
}
