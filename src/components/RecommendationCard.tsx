import type { Activity } from '../types/activity'
import type { CompletedActivity } from '../features/activityHistory/types'

type RecommendationCardProps = {
  activity: Activity
  completedActivity: CompletedActivity | undefined
  isFavorite: boolean
  onDoThis: (activityId: string) => void
  onToggleFavorite: () => void
}

const durationLabels = {
  '10-minutes': '10 mins',
  '30-minutes': '30 mins',
  '1-hour': '1 hr',
  '2-plus-hours': '2+ hrs',
} as const

export function RecommendationCard({
  activity,
  completedActivity,
  isFavorite,
  onDoThis,
  onToggleFavorite,
}: RecommendationCardProps) {
  return (
    <article
      aria-label={`${activity.title} recommendation`}
      className={`flex min-w-0 flex-col justify-between rounded-xl border p-5 shadow-sm transition duration-200 lg:min-w-[280px] ${
        completedActivity
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{activity.category}</p>
          <h3 className="mt-1 break-words hyphens-auto text-xl font-semibold text-slate-900">{activity.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
          +{activity.xpReward} XP
        </span>
      </div>
      <p className="mt-3 leading-6 text-slate-600">{activity.description}</p>
      {completedActivity && (
        <p className="mt-3 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-900" role="status">
          Completed · +{completedActivity.xpReward} XP earned
        </p>
      )}
      <dl className="my-2 grid grid-cols-3 gap-2 border-y border-emerald-100 py-2 text-xs">
        <div className="min-w-0">
          <dt className="whitespace-nowrap text-slate-500">Duration</dt>
          <dd className="mt-1 whitespace-nowrap font-medium text-slate-800">{durationLabels[activity.duration]}</dd>
        </div>
        <div className="min-w-0">
          <dt className="whitespace-nowrap text-slate-500">Energy</dt>
          <dd className="mt-1 whitespace-nowrap font-medium capitalize text-slate-800">{activity.energy}</dd>
        </div>
        <div className="min-w-0">
          <dt className="whitespace-nowrap text-slate-500">Budget</dt>
          <dd className="mt-1 whitespace-nowrap font-medium capitalize text-slate-800">{activity.budget}</dd>
        </div>
      </dl>
      <div className="mt-auto flex w-full gap-2 pt-3">
        <button
          aria-pressed={Boolean(completedActivity)}
          className="min-h-11 min-w-0 flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-emerald-700"
          disabled={Boolean(completedActivity)}
          onClick={() => onDoThis(activity.id)}
          type="button"
        >
          {completedActivity ? 'Completed' : 'Do This'}
        </button>
        <button
          aria-label={isFavorite ? `Remove ${activity.title} from favorites` : `Add ${activity.title} to favorites`}
          aria-pressed={isFavorite}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-amber-400 px-3 py-2 text-sm font-semibold text-amber-900 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          onClick={onToggleFavorite}
          type="button"
        >
          <span aria-hidden="true" className={`mr-1 inline-block text-lg leading-none transition-colors ${isFavorite ? 'favorite-heart-active text-rose-500' : 'text-amber-700'}`}>♥</span>
          {isFavorite ? 'Favorited' : 'Favorite'}
        </button>
      </div>
    </article>
  )
}
