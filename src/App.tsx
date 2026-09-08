import { useCallback, useState } from 'react'
import { Toast, type ToastKind } from './components/Toast'
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
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null)

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    setToast({ message, kind })
  }, [])

  async function handleLogin(email: string, password: string) {
    try {
      await auth.login(email, password)
    } catch (error) {
      showToast('Authentication failed. Please try again.', 'error')
      throw error
    }
  }

  async function handleSignUp(email: string, password: string) {
    try {
      await auth.signUp(email, password)
    } catch (error) {
      showToast('Authentication failed. Please try again.', 'error')
      throw error
    }
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
    <main className="min-h-screen bg-amber-50 px-4 py-6 text-slate-900 sm:px-6 lg:py-10">
      <header className="mx-auto flex max-w-6xl flex-col gap-4 px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-0" role="banner">
        <a className="w-fit rounded-lg text-lg font-bold tracking-tight text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600" href="/">DaySpark</a>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {auth.user && (
            <nav aria-label="Account navigation" className="flex flex-wrap items-center gap-1">
              <button className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${view === 'discover' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`} onClick={() => setView('discover')} type="button">Discover</button>
              <button aria-current={view === 'profile' ? 'page' : undefined} className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${view === 'profile' ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`} onClick={() => setView('profile')} type="button">Profile</button>
            </nav>
          )}
          <AuthHeader loading={auth.loading} onSignIn={() => setIsAuthModalOpen(true)} onSignOut={() => { void auth.logout() }} user={auth.user} />
        </div>
      </header>
      <section className="mx-auto mt-4 max-w-6xl rounded-2xl bg-white p-6 shadow-xl shadow-amber-950/5 sm:mt-6 sm:p-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">DaySpark</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What would feel good right now?
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
            Tell us a little about your moment and we will prepare some activity ideas.
          </p>
        </div>
        {view === 'profile' && auth.user ? (
          <ProfilePage
            completedActivitiesCount={loadCompletedActivities().length}
            customActivitiesCount={0}
            favoritesCount={loadFavoriteActivityIds().length}
            loading={auth.loading}
            onClearLocalData={clearLocalData}
            onDeleteData={deleteAccountData}
            onResync={async () => { await migrateLocalData(auth.user!.uid); showToast('Data synced to cloud successfully') }}
            onSaveProfile={auth.updateAccountProfile}
            onSignOut={auth.logout}
            stats={loadUserStats()}
            user={auth.user}
          />
        ) : <RecommendationsExperience onToast={showToast} userId={auth.user?.uid ?? null} />}
        {isAuthModalOpen && <AuthModal error={auth.error} loading={auth.loading} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} onSignUp={handleSignUp} />}
      </section>
      {toast && <Toast kind={toast.kind} message={toast.message} onDismiss={() => setToast(null)} />}
    </main>
  )
}

export default App
