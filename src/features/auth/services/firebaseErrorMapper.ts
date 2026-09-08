type FirebaseAuthError = {
  code?: unknown
}

const messages: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/wrong-password': 'Invalid email or password. Please try again.',
  'auth/user-not-found': 'Invalid email or password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
}

export function mapFirebaseAuthError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? (error as FirebaseAuthError).code
    : undefined

  return typeof code === 'string' ? messages[code] ?? 'An error occurred during sign in. Please try again.' : 'An error occurred during sign in. Please try again.'
}
