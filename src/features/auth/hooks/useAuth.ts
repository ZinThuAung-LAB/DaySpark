import { useCallback, useEffect, useState } from 'react'
import type { AuthState, UserProfile } from '../types/auth'
import { getCurrentUser, login as loginWithService, logout as logoutWithService, onAuthStateChange, signUp as signUpWithService, updateAccountProfile as updateAccountProfileWithService } from '../services/authService'
import { migrateLocalData, setActiveUser } from '../../../services/dbService'
import { mapFirebaseAuthError } from '../services/firebaseErrorMapper'
import { notifyUserDataChanged } from '../../../services/userDataLifecycle'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: getCurrentUser(),
    loading: true,
    error: null,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user, error) => {
      setAuthState({ user, loading: false, error })
      setActiveUser(user?.uid ?? null)
      if (user) {
        void migrateLocalData(user.uid).then(() => notifyUserDataChanged())
      } else {
        notifyUserDataChanged()
      }
    })

    return unsubscribe
  }, [])

  const runAuthAction = useCallback(async (action: () => Promise<UserProfile | void>) => {
    setAuthState((current) => ({ ...current, loading: true, error: null }))

    try {
      const user = await action()
      setAuthState((current) => ({ ...current, user: user ?? current.user, loading: false }))
      return user
    } catch (error) {
      setAuthState((current) => ({ ...current, loading: false, error: mapFirebaseAuthError(error) }))
      throw error
    }
  }, [])

  const signUp = useCallback((email: string, password: string) => runAuthAction(() => signUpWithService(email, password)), [runAuthAction])
  const login = useCallback((email: string, password: string) => runAuthAction(() => loginWithService(email, password)), [runAuthAction])
  const logout = useCallback(async () => {
    setAuthState((current) => ({ ...current, loading: true, error: null }))

    try {
      await logoutWithService()
      setActiveUser(null)
      notifyUserDataChanged()
      setAuthState({ user: null, loading: false, error: null })
    } catch (error) {
      setAuthState((current) => ({ ...current, loading: false, error: mapFirebaseAuthError(error) }))
      throw error
    }
  }, [])
  const updateAccountProfile = useCallback((displayName: string, photoURL: string | null) => runAuthAction(() => updateAccountProfileWithService(displayName, photoURL)), [runAuthAction])

  return { ...authState, signUp, login, logout, updateAccountProfile }
}
