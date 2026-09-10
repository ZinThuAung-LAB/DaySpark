import { useState, type FormEvent } from 'react'
import type { UserProfile } from '../../auth/types/auth'
import type { UserStats } from '../../../types/gamification'
import type { CompletedActivity } from '../../activityHistory/types'
import { MoodAnalytics } from '../../analytics/components/MoodAnalytics'
import { NotificationSettings } from './NotificationSettings'
import { STREAK_FREEZE_XP_COST } from '../../gamification/services/streakService'
import { sanitizeHttpUrl, sanitizePlainText } from '../../../utils/input-sanitization'

type ProfilePageProps = {
  completedActivitiesCount: number
  completedActivities: readonly CompletedActivity[]
  customActivitiesCount: number
  favoritesCount: number
  loading: boolean
  onClearLocalData: () => void
  onDeleteData: () => Promise<void>
  onResync: () => Promise<void>
  onSaveProfile: (displayName: string, photoURL: string | null) => Promise<unknown>
  onSignOut: () => Promise<void>
  onUnlockStreakFreeze: () => boolean
  stats: UserStats
  user: UserProfile
}

function formatJoinDate(createdAt: string | null): string {
  return createdAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(createdAt)) : 'Not available'
}

export function ProfilePage({
  completedActivitiesCount,
  completedActivities,
  customActivitiesCount,
  favoritesCount,
  loading,
  onClearLocalData,
  onDeleteData,
  onResync,
  onSaveProfile,
  onSignOut,
  onUnlockStreakFreeze,
  stats,
  user,
}: ProfilePageProps) {
  const [displayName, setDisplayName] = useState(user.displayName ?? '')
  const [photoURL, setPhotoURL] = useState(user.photoURL ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSaveProfile(sanitizePlainText(displayName), sanitizeHttpUrl(photoURL))
    setMessage('Profile updated.')
  }

  async function handleResync() {
    await onResync()
    setMessage('Your local progress has been synced.')
  }

  async function handleDeleteData() {
    if (!isDeleting) {
      setIsDeleting(true)
      return
    }

    await onDeleteData()
    setIsDeleting(false)
    setMessage('Account data deleted.')
  }

  return (
    <section aria-labelledby="profile-heading" className="mt-8 space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Your account</p>
        <h2 id="profile-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Profile and settings</h2>
      </div>
      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="account-details-heading" className="rounded-2xl border border-slate-200 p-5">
          <h3 id="account-details-heading" className="text-xl font-bold text-slate-900">Account details</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="break-all font-medium text-slate-900">{user.email ?? 'Not available'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Join date</dt><dd className="font-medium text-slate-900">{formatJoinDate(user.createdAt)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Account type</dt><dd className="font-medium text-slate-900">Free</dd></div>
          </dl>
        </section>
        <section aria-labelledby="progress-overview-heading" className="rounded-2xl bg-slate-900 p-5 text-white">
          <h3 id="progress-overview-heading" className="text-xl font-bold">Gamification overview</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <p><span className="block text-2xl font-bold text-amber-300">{stats.level}</span><span className="text-xs text-slate-300">Level</span></p>
            <p><span className="block text-2xl font-bold text-amber-300">{stats.xp}</span><span className="text-xs text-slate-300">Total XP</span></p>
            <p><span className="block text-2xl font-bold text-amber-300">🔥 {stats.currentStreak}</span><span className="text-xs text-slate-300">Current streak</span></p>
            <p><span className="block text-2xl font-bold text-amber-300">{stats.bestStreak}</span><span className="text-xs text-slate-300">Best streak</span></p>
            <p><span className="block text-2xl font-bold text-amber-300">{stats.streakFreezes}</span><span className="text-xs text-slate-300">Streak Freezes</span></p>
          </div>
        </section>
      </div>
      <section aria-labelledby="account-stats-heading" className="rounded-2xl border border-slate-200 p-5">
        <h3 id="account-stats-heading" className="text-xl font-bold text-slate-900">Account stats</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-amber-50 p-4"><dt className="text-sm text-slate-600">Completed activities</dt><dd className="mt-1 text-2xl font-bold text-slate-900">{completedActivitiesCount}</dd></div>
          <div className="rounded-xl bg-amber-50 p-4"><dt className="text-sm text-slate-600">Custom activities</dt><dd className="mt-1 text-2xl font-bold text-slate-900">{customActivitiesCount}</dd></div>
          <div className="rounded-xl bg-amber-50 p-4"><dt className="text-sm text-slate-600">Favorites</dt><dd className="mt-1 text-2xl font-bold text-slate-900">{favoritesCount}</dd></div>
        </dl>
      </section>
      <MoodAnalytics completedActivities={completedActivities} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form aria-labelledby="profile-settings-heading" className="rounded-2xl border border-slate-200 p-5" onSubmit={handleSave}>
          <h3 id="profile-settings-heading" className="text-xl font-bold text-slate-900">Profile settings</h3>
          <label className="mt-4 block text-sm font-medium text-slate-800" htmlFor="display-name">Display name
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" id="display-name" onChange={(event) => setDisplayName(event.target.value)} value={displayName} />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-800" htmlFor="avatar-url">Avatar image URL
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" id="avatar-url" onChange={(event) => setPhotoURL(event.target.value)} placeholder="https://…" type="url" value={photoURL} />
          </label>
          <button className="mt-4 min-h-11 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed" disabled={loading} type="submit">Save profile</button>
        </form>
        <div className="space-y-6">
          <section aria-labelledby="streak-freeze-heading" className="rounded-2xl border border-slate-200 p-5">
            <h3 id="streak-freeze-heading" className="text-xl font-bold text-slate-900">Streak Freeze</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">You have <strong>{stats.streakFreezes}</strong> available. Earn one free Freeze every 7 consecutive days, or unlock one for {STREAK_FREEZE_XP_COST} XP.</p>
            <button className="mt-4 min-h-11 rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400" disabled={stats.xp < STREAK_FREEZE_XP_COST} onClick={onUnlockStreakFreeze} type="button">Unlock Streak Freeze ({STREAK_FREEZE_XP_COST} XP)</button>
          </section>
          <NotificationSettings />
          <section aria-labelledby="data-settings-heading" className="rounded-2xl border border-slate-200 p-5">
          <h3 id="data-settings-heading" className="text-xl font-bold text-slate-900">Data and account</h3>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" onClick={onClearLocalData} type="button">Clear local cache</button>
            <button className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600" disabled={loading} onClick={() => { void handleResync() }} type="button">Re-sync with cloud</button>
            <button className="min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900" disabled={loading} onClick={() => { void onSignOut() }} type="button">Sign out</button>
          </div>
          <div className="mt-6 border-t border-red-100 pt-5">
            <p className="text-sm text-slate-600">{isDeleting ? 'This permanently clears your local and cloud progress. Select Delete account data again to confirm.' : 'Delete your stored DaySpark progress from this device and the cloud.'}</p>
            <button className="mt-3 min-h-11 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600" disabled={loading} onClick={() => { void handleDeleteData() }} type="button">{isDeleting ? 'Confirm delete account data' : 'Delete account data'}</button>
          </div>
          </section>
        </div>
      </div>
    </section>
  )
}
