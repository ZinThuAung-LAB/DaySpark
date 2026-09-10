type FirebaseClientConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function requiredPublicValue(value: string | undefined): string | null {
  const normalized = value?.trim()
  if (!normalized || /^(your-|change-me|example)/i.test(normalized)) return null
  return normalized
}

function getFirebaseClientConfig(): FirebaseClientConfig | null {
  const apiKey = requiredPublicValue(import.meta.env.VITE_FIREBASE_API_KEY)
  const authDomain = requiredPublicValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
  const projectId = requiredPublicValue(import.meta.env.VITE_FIREBASE_PROJECT_ID)
  const storageBucket = requiredPublicValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)
  const messagingSenderId = requiredPublicValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
  const appId = requiredPublicValue(import.meta.env.VITE_FIREBASE_APP_ID)

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) return null
  if (!/^[a-z0-9-]+$/i.test(projectId) || !/^[\w.-]+$/.test(authDomain) || !/^\d+$/.test(messagingSenderId) || !/^\d+:.+:.+$/.test(appId)) return null

  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }
}

export const appName = requiredPublicValue(import.meta.env.VITE_APP_NAME) ?? 'DaySpark'
export const firebaseClientConfig = getFirebaseClientConfig()
export const monitoringEndpoint = requiredPublicValue(import.meta.env.VITE_MONITORING_ENDPOINT)
