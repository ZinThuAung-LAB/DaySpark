import { RecommendationsExperience } from './features/recommendations/RecommendationsExperience'

function App() {
  return (
    <main className="min-h-screen bg-amber-50 px-4 py-10 text-slate-900 sm:px-6 lg:py-16">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-xl shadow-amber-950/5 sm:p-10">
        <header className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">DaySpark</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What would feel good right now?
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
            Tell us a little about your moment and we will prepare some activity ideas.
          </p>
        </header>
        <RecommendationsExperience />
      </section>
    </main>
  )
}

export default App
