import { mapFirebaseAuthError } from './firebaseErrorMapper'

describe('mapFirebaseAuthError', () => {
  it.each([
    ['auth/invalid-credential', 'Invalid email or password. Please try again.'],
    ['auth/wrong-password', 'Invalid email or password. Please try again.'],
    ['auth/user-not-found', 'Invalid email or password. Please try again.'],
    ['auth/email-already-in-use', 'An account with this email already exists.'],
    ['auth/weak-password', 'Password should be at least 6 characters long.'],
    ['auth/invalid-email', 'Please enter a valid email address.'],
    ['auth/too-many-requests', 'Too many failed attempts. Please try again later.'],
  ])('maps %s', (code, message) => {
    expect(mapFirebaseAuthError({ code })).toBe(message)
  })

  it('uses a safe fallback for unknown errors', () => {
    expect(mapFirebaseAuthError(new Error('Firebase: Error (auth/unknown).'))).toBe('An error occurred during sign in. Please try again.')
  })
})
