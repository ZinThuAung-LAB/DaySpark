import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged as subscribeToFirebaseAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type Unsubscribe,
  type User,
} from 'firebase/auth'
import type { UserProfile } from '../types/auth'
import { mapFirebaseAuthError } from './firebaseErrorMapper'
import { clearCompletedActivities } from '../../activityHistory/completed-activity-storage'
import { clearFavoriteActivityIds } from '../../activityFavorites/favorite-activity-storage'
import { clearUserStats } from '../../gamification/services/gamificationService'
import { removeLocalStorage } from '../../../utils/local-storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let demoUser: UserProfile | null = null
const demoAuthListeners = new Set<(user: UserProfile | null, error: string | null) => void>()
let hasWarnedAboutDemoMode = false

function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId)
}

function isDemoMode(): boolean {
  return !isFirebaseConfigured()
}

function warnAboutDemoMode(): void {
  if (!hasWarnedAboutDemoMode) {
    console.warn('Firebase is not configured. DaySpark is using demo authentication; add VITE_FIREBASE_* values to enable cloud accounts.')
    hasWarnedAboutDemoMode = true
  }
}

function notifyDemoAuthListeners(): void {
  demoAuthListeners.forEach((listener) => listener(demoUser, null))
}

function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) {
    return null
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

function createDemoUser(email: string): UserProfile {
  return {
    uid: `demo-${email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    email,
    displayName: null,
    photoURL: null,
    createdAt: new Date().toISOString(),
  }
}

function toUserProfile(user: User): UserProfile {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: user.metadata.creationTime ?? null,
  }
}

export async function signUp(email: string, password: string): Promise<UserProfile> {
  if (isDemoMode()) {
    warnAboutDemoMode()
    demoUser = createDemoUser(email)
    notifyDemoAuthListeners()
    return demoUser
  }

  const auth = getFirebaseAuth()

  if (!auth) {
    throw new Error('Unable to initialize Firebase authentication.')
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password)
  return toUserProfile(credential.user)
}

export async function login(email: string, password: string): Promise<UserProfile> {
  if (isDemoMode()) {
    warnAboutDemoMode()
    demoUser = createDemoUser(email)
    notifyDemoAuthListeners()
    return demoUser
  }

  const auth = getFirebaseAuth()

  if (!auth) {
    throw new Error('Unable to initialize Firebase authentication.')
  }

  const credential = await signInWithEmailAndPassword(auth, email, password)
  return toUserProfile(credential.user)
}

export async function logout(): Promise<void> {
  if (isDemoMode()) {
    demoUser = null
    clearUserData()
    notifyDemoAuthListeners()
    return
  }

  const auth = getFirebaseAuth()

  if (!auth) {
    return
  }

  await signOut(auth)
  clearUserData()
}

function clearUserData(): void {
  clearCompletedActivities()
  clearFavoriteActivityIds()
  clearUserStats()
  // Keep cleanup forward-compatible with data collections added by later features.
  removeLocalStorage('dayspark.custom-activities')
  removeLocalStorage('dayspark_custom_activities')
}

export async function updateAccountProfile(displayName: string, photoURL: string | null): Promise<UserProfile> {
  if (isDemoMode()) {
    if (!demoUser) {
      throw new Error('You need to be signed in to update your profile.')
    }

    demoUser = { ...demoUser, displayName: displayName || null, photoURL }
    notifyDemoAuthListeners()
    return demoUser
  }

  const auth = getFirebaseAuth()

  if (!auth?.currentUser) {
    throw new Error('You need to be signed in to update your profile.')
  }

  await updateProfile(auth.currentUser, { displayName: displayName || null, photoURL })
  return toUserProfile(auth.currentUser)
}

export function getCurrentUser(): UserProfile | null {
  if (isDemoMode()) {
    return demoUser
  }

  const auth = getFirebaseAuth()
  return auth?.currentUser ? toUserProfile(auth.currentUser) : null
}

export function onAuthStateChange(
  onChange: (user: UserProfile | null, error: string | null) => void,
): Unsubscribe {
  if (isDemoMode()) {
    warnAboutDemoMode()
    demoAuthListeners.add(onChange)
    onChange(demoUser, null)
    return () => demoAuthListeners.delete(onChange)
  }

  const auth = getFirebaseAuth()

  if (!auth) {
    onChange(null, null)
    return () => undefined
  }

  return subscribeToFirebaseAuth(
    auth,
    (user) => onChange(user ? toUserProfile(user) : null, null),
    (error) => onChange(null, mapFirebaseAuthError(error)),
  )
}
