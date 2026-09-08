import type { Activity } from '../types/activity'
import type { CompletedActivity } from '../features/activityHistory/types'
import { RecommendationCard } from './RecommendationCard'

type RecommendationResultsProps = {
  activities: readonly Activity[]
  emptyMessage: string | null
  isFavorite: (activityId: string) => boolean
  message: string | null
  onDoThis: (activityId: string) => void
  onToggleFavorite: (activityId: string) => void
  onTryAnother: (activityId: string) => void
  getCompletion: (activityId: string) => CompletedActivity | undefined
}

export function RecommendationResults({
  activities,
  emptyMessage,
  isFavorite,
  message,
  onDoThis,
  onToggleFavorite,
  onTryAnother,
  getCompletion,
}: RecommendationResultsProps) {
  if (activities.length === 0) {
    return (
      <section aria-labelledby="recommendations-heading" className="mt-10 border-t border-slate-200 pt-8">
        <h2 id="recommendations-heading" className="text-2xl font-bold text-slate-900">
          Your activity ideas
        </h2>
        <p className="mt-3 rounded-xl bg-slate-100 p-4 text-slate-700" role="status">
          {emptyMessage ?? 'We could not find compatible activities. Try adjusting one or more preferences.'}
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="recommendations-heading" className="mt-10 border-t border-slate-200 pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="recommendations-heading" className="text-2xl font-bold text-slate-900">
          Your activity ideas
        </h2>
        <p className="text-sm text-slate-500">Choose one that feels right.</p>
      </div>
      {message && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          {message}
        </p>
      )}
      <div className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {activities.map((activity) => (
          <RecommendationCard
            activity={activity}
            completedActivity={getCompletion(activity.id)}
            isFavorite={isFavorite(activity.id)}
            key={activity.id}
            onDoThis={onDoThis}
            onToggleFavorite={() => onToggleFavorite(activity.id)}
          />
        ))}
      </div>
      <div aria-label="Try another activity" className="mx-auto mt-4 grid w-full max-w-6xl gap-2 sm:grid-cols-3">
        {activities.map((activity) => (
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-500 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            key={activity.id}
            onClick={() => onTryAnother(activity.id)}
            type="button"
          >
            Try Another
          </button>
        ))}
      </div>
    </section>
  )
}
