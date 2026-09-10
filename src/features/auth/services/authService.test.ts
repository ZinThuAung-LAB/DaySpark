import { getCurrentUser, login, logout, onAuthStateChange, signUp, updateAccountProfile } from './authService'
import { USER_STATS_STORAGE_KEY } from '../../gamification/services/gamificationService'

describe('authService demo mode', () => {
  afterEach(async () => {
    await logout()
  })

  it.skipIf(Boolean(import.meta.env.VITE_FIREBASE_API_KEY))('supports local authentication when Firebase keys are not configured', async () => {
    const listener = vi.fn()
    const unsubscribe = onAuthStateChange(listener)

    const user = await signUp('demo@dayspark.test', 'password')

    expect(user).toMatchObject({ uid: 'demo-demo-dayspark-test', email: 'demo@dayspark.test' })
    expect(getCurrentUser()).toEqual(user)
    expect(listener).toHaveBeenLastCalledWith(user, null)

    const updatedUser = await updateAccountProfile('Demo User', null)
    expect(updatedUser.displayName).toBe('Demo User')

    await login('returning@dayspark.test', 'password')
    expect(getCurrentUser()?.email).toBe('returning@dayspark.test')

    unsubscribe()
  })

  it.skipIf(Boolean(import.meta.env.VITE_FIREBASE_API_KEY))('clears all locally persisted user data on sign-out', async () => {
    window.localStorage.setItem(USER_STATS_STORAGE_KEY, '{"xp":20}')
    window.localStorage.setItem('dayspark.completed-activities', '[]')
    window.localStorage.setItem('dayspark.favorite-activity-ids', '["read"]')
    window.localStorage.setItem('dayspark.custom-activities', '[]')
    await signUp('demo@dayspark.test', 'password')

    await logout()

    expect(window.localStorage.getItem(USER_STATS_STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem('dayspark.completed-activities')).toBeNull()
    expect(window.localStorage.getItem('dayspark.favorite-activity-ids')).toBeNull()
    expect(window.localStorage.getItem('dayspark.custom-activities')).toBeNull()
  })
})
