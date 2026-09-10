import { useCallback, useEffect, useState } from 'react'
import { Toast, type ToastKind } from './components/Toast'
import { AuthHeader } from './features/auth/components/AuthHeader'
import { AuthModal } from './features/auth/components/AuthModal'
import { useAuth } from './features/auth/hooks/useAuth'
import { ProfilePage } from './features/profile/components/ProfilePage'
import { clearFavoriteActivityIds, loadFavoriteActivityIds } from './features/activityFavorites/favorite-activity-storage'
import { clearCompletedActivities, loadCompletedActivities } from './features/activityHistory/completed-activity-storage'
import { clearUserStats, loadUserStats, saveUserStats } from './features/gamification/services/gamificationService'
import { unlockStreakFreezeWithXP } from './features/gamification/services/streakService'
import { REMINDER_SETTINGS_CHANGED_EVENT, scheduleDailyActivityReminder } from './features/gamification/services/notificationService'
import { RecommendationsExperience } from './features/recommendations/RecommendationsExperience'
import { deleteUserData, migrateLocalData } from './services/dbService'

type AppView = 'discover' | 'profile'

function App() {
  const auth = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [view, setView] = useState<AppView>('discover')
  const [, setDataRevision] = useState(0)
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [wasStreakSaved, setWasStreakSaved] = useState(false)
  const [reminderRevision, setReminderRevision] = useState(0)

  useEffect(() => {
    const completedToday = loadCompletedActivities().some((activity) => new Date(activity.completedAt).toDateString() === new Date().toDateString())
    return scheduleDailyActivityReminder(completedToday)
  }, [reminderRevision])

  useEffect(() => {
    const refreshReminder = () => setReminderRevision((revision) => revision + 1)
    window.addEventListener(REMINDER_SETTINGS_CHANGED_EVENT, refreshReminder)
    return () => window.removeEventListener(REMINDER_SETTINGS_CHANGED_EVENT, refreshReminder)
  }, [])

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

  function unlockStreakFreeze(): boolean {
    const nextStats = unlockStreakFreezeWithXP(loadUserStats())
    if (!nextStats) return false
    saveUserStats(nextStats)
    setDataRevision((revision) => revision + 1)
    showToast('Streak Freeze unlocked for 100 XP')
    return true
  }

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-3 text-slate-900 sm:px-6 sm:py-6 lg:py-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-0" role="banner">
        <a className="w-fit rounded-lg text-lg font-bold tracking-tight text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600" href="/">DaySpark</a>
        <div className="flex items-center gap-2">
          {auth.user && (
            <>
              <nav aria-label="Account navigation" className="hidden items-center gap-1 md:flex">
              <button className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${view === 'discover' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`} onClick={() => setView('discover')} type="button">Discover</button>
              <button aria-current={view === 'profile' ? 'page' : undefined} className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${view === 'profile' ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`} onClick={() => setView('profile')} type="button">Profile</button>
              </nav>
              <div className="relative md:hidden">
                <button
                  aria-controls="mobile-navigation"
                  aria-expanded={isMobileNavOpen}
                  aria-label="Open navigation menu"
                  className="flex size-11 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                  onClick={() => setIsMobileNavOpen((open) => !open)}
                  type="button"
                >
                  <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
                </button>
                {isMobileNavOpen && (
                  <nav aria-label="Mobile account navigation" className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg" id="mobile-navigation">
                    <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-amber-50" onClick={() => { setView('discover'); setIsMobileNavOpen(false) }} type="button">Discover</button>
                    <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-amber-50" onClick={() => { setView('profile'); setIsMobileNavOpen(false) }} type="button">Profile</button>
                  </nav>
                )}
              </div>
            </>
          )}
          <AuthHeader loading={auth.loading} onProfile={() => { setView('profile'); setIsMobileNavOpen(false) }} onSignIn={() => setIsAuthModalOpen(true)} onSignOut={() => { void auth.logout() }} user={auth.user} />
        </div>
      </header>
      <section className="mx-auto mt-3 max-w-6xl rounded-2xl bg-white p-4 shadow-xl shadow-amber-950/5 sm:mt-6 sm:p-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">DaySpark</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:mt-3 sm:text-3xl">
            What would feel good right now?
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600 sm:mt-3 sm:text-lg">
            Tell us a little about your moment and we will prepare some activity ideas.
          </p>
        </div>
        {view === 'profile' && auth.user ? (
          <ProfilePage
            completedActivitiesCount={loadCompletedActivities().length}
            completedActivities={loadCompletedActivities()}
            customActivitiesCount={0}
            favoritesCount={loadFavoriteActivityIds().length}
            loading={auth.loading}
            onClearLocalData={clearLocalData}
            onDeleteData={deleteAccountData}
            onResync={async () => { await migrateLocalData(auth.user!.uid); showToast('Data synced to cloud successfully') }}
            onSaveProfile={auth.updateAccountProfile}
            onSignOut={auth.logout}
            onUnlockStreakFreeze={unlockStreakFreeze}
            stats={loadUserStats()}
            user={auth.user}
          />
        ) : <>
          {wasStreakSaved && <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900" role="status"><span>Your streak was saved by a Streak Freeze!</span><button aria-label="Dismiss streak saved message" className="shrink-0 rounded p-1 hover:bg-sky-100" onClick={() => setWasStreakSaved(false)} type="button">×</button></div>}
          <RecommendationsExperience onActivityCompleted={() => setReminderRevision((revision) => revision + 1)} onStreakFreezeUsed={() => setWasStreakSaved(true)} onToast={showToast} userId={auth.user?.uid ?? null} />
        </>}
        {isAuthModalOpen && <AuthModal error={auth.error} loading={auth.loading} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} onSignUp={handleSignUp} />}
      </section>
      {toast && <Toast kind={toast.kind} message={toast.message} onDismiss={() => setToast(null)} />}
    </main>
  )
}

export default App
