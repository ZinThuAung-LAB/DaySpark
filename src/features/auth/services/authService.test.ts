import { getCurrentUser, login, logout, onAuthStateChange, signUp, updateAccountProfile } from './authService'

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
})
