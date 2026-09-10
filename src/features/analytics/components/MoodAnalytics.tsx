import type { CompletedActivity } from '../../activityHistory/types'
import { aggregateMoodAnalytics } from '../analytics.utils'

type MoodAnalyticsProps = {
  completedActivities: readonly CompletedActivity[]
}

export function MoodAnalytics({ completedActivities }: MoodAnalyticsProps) {
  const analytics = aggregateMoodAnalytics(completedActivities)
  const maxXP = analytics.xpGrowth.at(-1)?.totalXP ?? 0

  return (
    <section aria-labelledby="mood-analytics-heading" className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-600">Your patterns</p>
          <h3 id="mood-analytics-heading" className="mt-1 text-xl font-bold text-slate-900">Mood trends</h3>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">{completedActivities.length} completed</span>
      </div>

      <aside className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-950" aria-label="Trend insight">
        {analytics.insight}
      </aside>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="top-moods-heading">
          <h4 id="top-moods-heading" className="font-semibold text-slate-900">Top moods</h4>
          {analytics.topMoods.length === 0 ? <p className="mt-3 text-sm text-slate-600">No mood data yet.</p> : (
            <ul className="mt-3 space-y-3">
              {analytics.topMoods.map((mood) => (
                <li key={mood.mood}>
                  <div className="flex justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{mood.label}</span><span className="text-slate-600">{mood.count} ({mood.percentage}%)</span></div>
                  <div aria-label={`${mood.label}: ${mood.count} completed activities`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={mood.percentage} className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${mood.percentage}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="activity-volume-heading">
          <h4 id="activity-volume-heading" className="font-semibold text-slate-900">Activity volume</h4>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-600">Last 7 days</dt><dd className="mt-1 text-2xl font-bold text-slate-900">{analytics.activityVolume.last7Days}</dd></div>
            <div className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-600">Last 30 days</dt><dd className="mt-1 text-2xl font-bold text-slate-900">{analytics.activityVolume.last30Days}</dd></div>
          </dl>
        </section>
      </div>

      <section aria-labelledby="xp-growth-heading" className="mt-6">
        <div className="flex items-baseline justify-between gap-3"><h4 id="xp-growth-heading" className="font-semibold text-slate-900">XP growth</h4><span className="text-sm text-slate-600">{maxXP} XP earned</span></div>
        {analytics.xpGrowth.length === 0 ? <p className="mt-3 text-sm text-slate-600">Complete an activity to start tracking XP growth.</p> : (
          <ol className="mt-3 flex h-28 items-end gap-2" aria-label="Cumulative XP earned over time">
            {analytics.xpGrowth.map((point) => <li className="flex min-w-0 flex-1 flex-col items-center gap-1" key={point.date}><span className="text-xs font-medium text-slate-600">{point.totalXP}</span><div aria-label={`${point.label}: ${point.totalXP} cumulative XP`} className="w-full rounded-t bg-emerald-500" style={{ height: `${Math.max(8, (point.totalXP / maxXP) * 72)}px` }} /><span className="truncate text-xs text-slate-500">{point.label}</span></li>)}
          </ol>
        )}
      </section>
    </section>
  )
}
