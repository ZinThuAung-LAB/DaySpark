export function RecommendationSkeleton() {
  return (
    <article aria-label="Loading recommendation" className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3"><div className="h-3 w-20 rounded bg-slate-200" /><div className="h-6 w-4/5 rounded bg-slate-200" /></div>
        <div className="h-7 w-16 rounded-full bg-amber-100" />
      </div>
      <div className="mt-5 space-y-2"><div className="h-4 rounded bg-slate-100" /><div className="h-4 w-5/6 rounded bg-slate-100" /></div>
      <div className="mt-6 h-10 rounded-lg bg-slate-100" />
    </article>
  )
}
