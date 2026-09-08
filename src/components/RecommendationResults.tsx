import type { Activity } from '../types/activity'
import { RecommendationCard } from './RecommendationCard'

type RecommendationResultsProps = {
  activities: readonly Activity[]
  message: string | null
  onDoThis: (activityId: string) => void
  onTryAnother: (activityId: string) => void
  selectedActivityIds: ReadonlySet<string>
}

export function RecommendationResults({
  activities,
  message,
  onDoThis,
  onTryAnother,
  selectedActivityIds,
}: RecommendationResultsProps) {
  if (activities.length === 0) {
    return (
      <section aria-labelledby="recommendations-heading" className="mt-10 border-t border-slate-200 pt-8">
        <h2 id="recommendations-heading" className="text-2xl font-bold text-slate-900">
          Your activity ideas
        </h2>
        <p className="mt-3 rounded-xl bg-slate-100 p-4 text-slate-700" role="status">
          We could not find compatible activities. Try adjusting one or more preferences.
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
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {activities.map((activity) => (
          <RecommendationCard
            activity={activity}
            isSelected={selectedActivityIds.has(activity.id)}
            key={activity.id}
            onDoThis={onDoThis}
            onTryAnother={onTryAnother}
          />
        ))}
      </div>
    </section>
  )
}
