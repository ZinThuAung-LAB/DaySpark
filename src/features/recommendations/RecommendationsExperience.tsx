import { useState, useTransition } from 'react'
import type { ToastKind } from '../../components/Toast'
import { RecommendationResults } from '../../components/RecommendationResults'
import { activities } from '../../data/activities'
import { DailyChallengeCard } from '../gamification/components/DailyChallengeCard'
import { GamificationHeader } from '../gamification/components/GamificationHeader'
import { useGamification } from '../gamification/hooks/useGamification'
import { FavoriteActivities } from '../activityFavorites/FavoriteActivities'
import { useFavoriteActivities } from '../activityFavorites/useFavoriteActivities'
import { RecentCompletions } from '../activityHistory/RecentCompletions'
import { useCompletedActivities } from '../activityHistory/useCompletedActivities'
import type { Activity } from '../../types/activity'
import type { CompletePreferences } from '../../types/preferences'
import { RecommendationForm } from './RecommendationForm'
import { getRecommendations } from './recommendation-engine'

export function RecommendationsExperience({ userId = null, onToast }: { userId?: string | null; onToast?: (message: string, kind?: ToastKind) => void }) {
  const [preferences, setPreferences] = useState<CompletePreferences | null>(null)
  const [recommendations, setRecommendations] = useState<Activity[]>([])
  const { completedActivities, completeActivity, getCompletion, getCompletionHistory } = useCompletedActivities(userId)
  const { favoriteActivityIds, favoriteActivity, unfavoriteActivity, isFavorite } = useFavoriteActivities(userId)
  const gamification = useGamification(undefined, userId)
  const [message, setMessage] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

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
      const completedActivity = completeActivity(activity)

      if (completedActivity) {
        gamification.completeActivity(completedActivity.xpReward)
        onToast?.(`Activity completed! +${completedActivity.xpReward} XP earned`)
      }
    }
  }

  function handleToggleFavorite(activityId: string) {
    if (isFavorite(activityId)) {
      unfavoriteActivity(activityId)
      onToast?.('Removed from Favorites', 'info')
      return
    }

    favoriteActivity(activityId)
    onToast?.('Saved to Favorites')
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
      <GamificationHeader
        currentStreak={gamification.currentStreak}
        didLevelUp={gamification.didLevelUp}
        lastXPReward={gamification.lastXPReward}
        level={gamification.level}
        progressPercentage={gamification.progressPercentage}
        xpIntoCurrentLevel={gamification.xpIntoCurrentLevel}
        xpToNextLevel={gamification.xpToNextLevel}
      />
      <RecommendationForm onSuggest={(nextPreferences) => { setHasSearched(true); startTransition(() => handleSuggest(nextPreferences)) }} />
      <DailyChallengeCard challenge={gamification.dailyChallenge} onComplete={() => { gamification.completeChallenge(); onToast?.(`Activity completed! +${gamification.dailyChallenge.xpReward} XP earned`) }} />
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
          loading={isPending}
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
