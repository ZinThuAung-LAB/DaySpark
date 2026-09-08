import { RecommendationCard } from '../../components/RecommendationCard'
import type { Activity } from '../../types/activity'
import type { CompletedActivity } from '../activityHistory/types'

type FavoriteActivitiesProps = {
  activities: readonly Activity[]
  favoriteActivityIds: readonly string[]
  getCompletion: (activityId: string) => CompletedActivity | undefined
  onDoThis: (activityId: string) => void
  onUnfavorite: (activityId: string) => void
}

export function FavoriteActivities({
  activities,
  favoriteActivityIds,
  getCompletion,
  onDoThis,
  onUnfavorite,
}: FavoriteActivitiesProps) {
  const activitiesById = new Map(activities.map((activity) => [activity.id, activity]))
  const favoriteActivities = favoriteActivityIds.flatMap((activityId) => {
    const activity = activitiesById.get(activityId)
    return activity ? [activity] : []
  })

  return (
    <section aria-labelledby="favorites-heading" className="mt-10 border-t border-slate-200 pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="favorites-heading" className="text-2xl font-bold text-slate-900">
          Favorite activities
        </h2>
        {favoriteActivities.length > 0 && <p className="text-sm text-slate-500">Keep ideas you want to revisit.</p>}
      </div>
      {favoriteActivities.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-100 p-4 text-slate-700">
          You have no favorite activities yet. Save an idea from your recommendations to find it here.
        </p>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {favoriteActivities.map((activity) => (
            <RecommendationCard
              activity={activity}
              completedActivity={getCompletion(activity.id)}
              isFavorite
              key={activity.id}
              onDoThis={onDoThis}
              onToggleFavorite={() => onUnfavorite(activity.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
