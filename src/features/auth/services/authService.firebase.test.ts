const firebaseAuth = vi.hoisted(() => ({
  getApp: vi.fn(() => ({ name: 'dayspark' })),
  getApps: vi.fn(() => [{ name: 'dayspark' }]),
  initializeApp: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: null })),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/app', () => ({ getApp: firebaseAuth.getApp, getApps: firebaseAuth.getApps, initializeApp: firebaseAuth.initializeApp }))
vi.mock('firebase/auth', () => ({
  getAuth: firebaseAuth.getAuth,
  createUserWithEmailAndPassword: firebaseAuth.createUserWithEmailAndPassword,
  signInWithEmailAndPassword: firebaseAuth.signInWithEmailAndPassword,
  signOut: firebaseAuth.signOut,
  updateProfile: firebaseAuth.updateProfile,
  onAuthStateChanged: firebaseAuth.onAuthStateChanged,
}))

const firebaseUser = { uid: 'cloud-user', email: 'cloud@dayspark.test', displayName: 'Cloud', photoURL: null, metadata: { creationTime: '2026-09-10T00:00:00.000Z' } }

describe('authService Firebase authentication', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-key')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'dayspark.test')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'dayspark-test')
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'dayspark-test.appspot.com')
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789012')
    vi.stubEnv('VITE_FIREBASE_APP_ID', '123456789012:web:app-id')
    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser })
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({ user: firebaseUser })
    firebaseAuth.signOut.mockResolvedValue(undefined)
  })

  afterEach(() => vi.unstubAllEnvs())

  it('delegates registration, login, and logout to Firebase Auth', async () => {
    const service = await import('./authService')
    await expect(service.signUp('cloud@dayspark.test', 'password')).resolves.toMatchObject({ uid: 'cloud-user' })
    await expect(service.login('cloud@dayspark.test', 'password')).resolves.toMatchObject({ email: 'cloud@dayspark.test' })
    await service.logout()

    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'cloud@dayspark.test', 'password')
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'cloud@dayspark.test', 'password')
    expect(firebaseAuth.signOut).toHaveBeenCalledWith(expect.anything())
  })
})
