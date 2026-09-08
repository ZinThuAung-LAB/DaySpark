export type UserProfile = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: string | null
}

export type AuthState = {
  user: UserProfile | null
  loading: boolean
  error: string | null
}
