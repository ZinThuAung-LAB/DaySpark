import { useState } from 'react'
import { RecommendationResults } from '../../components/RecommendationResults'
import { activities } from '../../data/activities'
import type { Activity } from '../../types/activity'
import type { CompletePreferences } from '../../types/preferences'
import { RecommendationForm } from './RecommendationForm'
import { getRecommendations } from './recommendation-engine'

export function RecommendationsExperience() {
  const [preferences, setPreferences] = useState<CompletePreferences | null>(null)
  const [recommendations, setRecommendations] = useState<Activity[]>([])
  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  function handleSuggest(nextPreferences: CompletePreferences) {
    setPreferences(nextPreferences)
    setRecommendations(getRecommendations(nextPreferences, activities))
    setSelectedActivityIds(new Set())
    setMessage(null)
    setHasSearched(true)
  }

  function handleDoThis(activityId: string) {
    setSelectedActivityIds((currentIds) => new Set(currentIds).add(activityId))
  }

  function handleTryAnother(activityId: string) {
    if (!preferences) {
      return
    }

    const displayedIds = new Set(recommendations.map((activity) => activity.id))
    const alternativeCatalog = activities.filter((activity) => !displayedIds.has(activity.id))
    const replacement = getRecommendations(preferences, alternativeCatalog)[0]

    if (!replacement) {
      setMessage('There are no other compatible activities to show right now.')
      return
    }

    setRecommendations((currentActivities) =>
      currentActivities.map((activity) => (activity.id === activityId ? replacement : activity)),
    )
    setSelectedActivityIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.delete(activityId)
      return nextIds
    })
    setMessage('Here is another compatible activity.')
  }

  return (
    <>
      <RecommendationForm onSuggest={handleSuggest} />
      {hasSearched && (
        <RecommendationResults
          activities={recommendations}
          message={message}
          onDoThis={handleDoThis}
          onTryAnother={handleTryAnother}
          selectedActivityIds={selectedActivityIds}
        />
      )}
    </>
  )
}
