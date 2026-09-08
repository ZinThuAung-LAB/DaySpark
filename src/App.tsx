import { useState } from 'react'
import { AuthHeader } from './features/auth/components/AuthHeader'
import { AuthModal } from './features/auth/components/AuthModal'
import { useAuth } from './features/auth/hooks/useAuth'
import { ProfilePage } from './features/profile/components/ProfilePage'
import { clearFavoriteActivityIds, loadFavoriteActivityIds } from './features/activityFavorites/favorite-activity-storage'
import { clearCompletedActivities, loadCompletedActivities } from './features/activityHistory/completed-activity-storage'
import { clearUserStats, loadUserStats } from './features/gamification/services/gamificationService'
import { RecommendationsExperience } from './features/recommendations/RecommendationsExperience'
import { deleteUserData, migrateLocalData } from './services/dbService'

type AppView = 'discover' | 'profile'

function App() {
  const auth = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [view, setView] = useState<AppView>('discover')
  const [, setDataRevision] = useState(0)

  async function handleLogin(email: string, password: string) {
    await auth.login(email, password)
  }

  async function handleSignUp(email: string, password: string) {
    await auth.signUp(email, password)
  }

  function clearLocalData() {
    clearFavoriteActivityIds()
    clearCompletedActivities()
    clearUserStats()
    setDataRevision((revision) => revision + 1)
  }

  async function deleteAccountData() {
    if (auth.user) {
      await deleteUserData(auth.user.uid)
    }
    clearLocalData()
  }

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-10 text-slate-900 sm:px-6 lg:py-16">
      <section className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-xl shadow-amber-950/5 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">DaySpark</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              What would feel good right now?
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
              Tell us a little about your moment and we will prepare some activity ideas.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {auth.user && (
              <nav aria-label="Account navigation">
                <button className={`rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${view === 'discover' ? 'text-amber-800' : 'text-slate-600 hover:bg-amber-50'}`} onClick={() => setView('discover')} type="button">Discover</button>
                <button aria-current={view === 'profile' ? 'page' : undefined} className={`rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${view === 'profile' ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:bg-amber-50'}`} onClick={() => setView('profile')} type="button">Profile</button>
              </nav>
            )}
            <AuthHeader loading={auth.loading} onSignIn={() => setIsAuthModalOpen(true)} onSignOut={() => { void auth.logout() }} user={auth.user} />
          </div>
        </header>
        {view === 'profile' && auth.user ? (
          <ProfilePage
            completedActivitiesCount={loadCompletedActivities().length}
            customActivitiesCount={0}
            favoritesCount={loadFavoriteActivityIds().length}
            loading={auth.loading}
            onClearLocalData={clearLocalData}
            onDeleteData={deleteAccountData}
            onResync={async () => { await migrateLocalData(auth.user!.uid) }}
            onSaveProfile={auth.updateAccountProfile}
            onSignOut={auth.logout}
            stats={loadUserStats()}
            user={auth.user}
          />
        ) : <RecommendationsExperience userId={auth.user?.uid ?? null} />}
        {isAuthModalOpen && <AuthModal error={auth.error} loading={auth.loading} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} onSignUp={handleSignUp} />}
      </section>
    </main>
  )
}

export default App
