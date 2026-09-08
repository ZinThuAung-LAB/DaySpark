import { act, renderHook } from '@testing-library/react'
import type { UserProfile } from '../types/auth'
import * as authService from '../services/authService'
import { useAuth } from './useAuth'

const user: UserProfile = {
  uid: 'user-1',
  email: 'hello@dayspark.test',
  displayName: null,
  photoURL: null,
  createdAt: '2026-09-08T00:00:00.000Z',
}

vi.mock('../services/authService', () => ({
  getCurrentUser: vi.fn(() => null),
  login: vi.fn(),
  logout: vi.fn(),
  onAuthStateChange: vi.fn((onChange: (nextUser: UserProfile | null, error: string | null) => void) => {
    onChange(null, null)
    return () => undefined
  }),
  signUp: vi.fn(),
  updateAccountProfile: vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.getCurrentUser).mockReturnValue(null)
    vi.mocked(authService.onAuthStateChange).mockImplementation((onChange) => {
      onChange(null, null)
      return () => undefined
    })
  })

  it('updates user state after a successful sign-up', async () => {
    vi.mocked(authService.signUp).mockResolvedValue(user)
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signUp('hello@dayspark.test', 'password')
    })

    expect(result.current).toMatchObject({ user, loading: false, error: null })
    expect(authService.signUp).toHaveBeenCalledWith('hello@dayspark.test', 'password')
  })

  it('exposes auth errors and clears the user on logout', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(user)
    vi.mocked(authService.onAuthStateChange).mockImplementation((onChange) => {
      onChange(user, null)
      return () => undefined
    })
    vi.mocked(authService.login).mockRejectedValue({ code: 'auth/wrong-password' })
    vi.mocked(authService.logout).mockResolvedValue(undefined)
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('hello@dayspark.test', 'wrong-password').catch(() => undefined)
    })

    expect(result.current.error).toBe('Invalid email or password. Please try again.')

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current).toMatchObject({ user: null, loading: false, error: null })
  })
})
