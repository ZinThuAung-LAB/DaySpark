import type { Activity } from '../types/activity'

type RecommendationCardProps = {
  activity: Activity
  isSelected: boolean
  onDoThis: (activityId: string) => void
  onTryAnother: (activityId: string) => void
}

const durationLabels = {
  '10-minutes': '10 minutes',
  '30-minutes': '30 minutes',
  '1-hour': '1 hour',
  '2-plus-hours': '2+ hours',
} as const

export function RecommendationCard({
  activity,
  isSelected,
  onDoThis,
  onTryAnother,
}: RecommendationCardProps) {
  return (
    <article
      aria-label={`${activity.title} recommendation`}
      className={`rounded-xl border p-5 shadow-sm transition duration-200 ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{activity.category}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{activity.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
          +{activity.xpReward} XP
        </span>
      </div>
      <p className="mt-3 leading-6 text-slate-600">{activity.description}</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Duration</dt>
          <dd className="mt-1 font-medium text-slate-800">{durationLabels[activity.duration]}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Energy</dt>
          <dd className="mt-1 font-medium capitalize text-slate-800">{activity.energy}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Budget</dt>
          <dd className="mt-1 font-medium capitalize text-slate-800">{activity.budget}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          aria-pressed={isSelected}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          onClick={() => onDoThis(activity.id)}
          type="button"
        >
          {isSelected ? 'Selected' : 'Do This'}
        </button>
        <button
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-amber-500 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          onClick={() => onTryAnother(activity.id)}
          type="button"
        >
          Try Another
        </button>
      </div>
    </article>
  )
}
