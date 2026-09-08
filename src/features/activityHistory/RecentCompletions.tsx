import type { CompletedActivity } from './types'

type RecentCompletionsProps = {
  completedActivities: readonly CompletedActivity[]
}

function formatCompletionDate(completedAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(completedAt))
}

export function RecentCompletions({ completedActivities }: RecentCompletionsProps) {
  const recentActivities = [...completedActivities]
    .sort((first, second) => new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime())
    .slice(0, 5)

  if (recentActivities.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="recent-completions-heading" className="mt-10 border-t border-slate-200 pt-8">
      <h2 id="recent-completions-heading" className="text-2xl font-bold text-slate-900">
        Recent completions
      </h2>
      <ol className="mt-4 space-y-3">
        {recentActivities.map((activity) => (
          <li className="flex items-center justify-between gap-4 rounded-xl bg-emerald-50 px-4 py-3" key={activity.completionId}>
            <div>
              <p className="font-medium text-slate-900">{activity.activityTitle}</p>
              <time className="text-sm text-slate-600" dateTime={activity.completedAt}>
                {formatCompletionDate(activity.completedAt)}
              </time>
            </div>
            <span className="shrink-0 font-semibold text-emerald-800">+{activity.xpReward} XP</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
