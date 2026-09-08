import { useState } from 'react'
import type { DailyChallenge } from '../../../types/gamification'

type DailyChallengeCardProps = {
  challenge: DailyChallenge
  onComplete: () => void
}

export function DailyChallengeCard({ challenge, onComplete }: DailyChallengeCardProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const isCompleted = Boolean(challenge.completedDate)

  function handleComplete() {
    onComplete()
  }

  return (
    <section aria-labelledby="daily-challenge-heading" className={`mt-6 rounded-2xl border p-5 transition-colors ${
      isCompleted ? 'border-emerald-400 bg-emerald-50' : 'border-amber-200 bg-amber-50'
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Daily challenge</p>
          <h2 id="daily-challenge-heading" className="mt-1 text-xl font-bold text-slate-900">
            {challenge.title}
          </h2>
          <p className="mt-2 text-slate-600">{challenge.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-200 px-3 py-1 text-sm font-semibold text-amber-950">+{challenge.xpReward} XP</span>
      </div>
      {isCompleted ? (
        <p className="mt-4 font-semibold text-emerald-800" role="status">Challenge completed today</p>
      ) : (
        <button
          className="mt-4 min-h-11 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-400 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          onClick={hasStarted ? handleComplete : () => setHasStarted(true)}
          type="button"
        >
          {hasStarted ? 'Complete Challenge' : 'Start Challenge'}
        </button>
      )}
    </section>
  )
}
