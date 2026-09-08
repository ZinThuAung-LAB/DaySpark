type GamificationHeaderProps = {
  currentStreak: number
  didLevelUp: boolean
  lastXPReward: number | null
  level: number
  progressPercentage: number
  xpIntoCurrentLevel: number
  xpToNextLevel: number
}

export function GamificationHeader({
  currentStreak,
  didLevelUp,
  lastXPReward,
  level,
  progressPercentage,
  xpIntoCurrentLevel,
  xpToNextLevel,
}: GamificationHeaderProps) {
  return (
    <section aria-label="Gamification progress" className="mt-8 grid gap-4 rounded-2xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-950/10 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="flex items-center gap-3">
        <span aria-label={`Level ${level}`} className="flex size-12 items-center justify-center rounded-full bg-amber-400 text-lg font-bold text-slate-950">
          {level}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Level</p>
          <p className="font-semibold">Level {level}</p>
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <p className="font-semibold">XP progress</p>
          <p className="text-slate-300">{xpIntoCurrentLevel} / {xpToNextLevel} XP</p>
        </div>
        <div
          aria-label="XP progress to next level"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progressPercentage)}
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-700"
          role="progressbar"
        >
          <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
        </div>
        {lastXPReward !== null && (
          <p aria-live="polite" className="mt-2 text-sm font-medium text-amber-200">
            +{lastXPReward} XP earned{didLevelUp ? ` · Level ${level} unlocked!` : ''}
          </p>
        )}
      </div>
      <p aria-label={`${currentStreak} day streak`} className="justify-self-start rounded-full bg-orange-500/20 px-3 py-2 text-sm font-semibold text-orange-100 sm:justify-self-end">
        🔥 {currentStreak} day{currentStreak === 1 ? '' : 's'}
      </p>
    </section>
  )
}
