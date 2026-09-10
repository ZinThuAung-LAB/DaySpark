const firestore = vi.hoisted(() => ({
  getApp: vi.fn(() => ({ name: 'dayspark' })),
  getApps: vi.fn(() => [{ name: 'dayspark' }]),
  initializeApp: vi.fn(),
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
  doc: vi.fn((_database: unknown, ...path: string[]) => path.join('/')),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}))

vi.mock('firebase/app', () => ({
  getApp: firestore.getApp,
  getApps: firestore.getApps,
  initializeApp: firestore.initializeApp,
}))
vi.mock('firebase/firestore', () => ({
  getFirestore: firestore.getFirestore,
  doc: firestore.doc,
  getDoc: firestore.getDoc,
  setDoc: firestore.setDoc,
  deleteDoc: firestore.deleteDoc,
}))

describe('dbService Firebase synchronization', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-key')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'dayspark.test')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'dayspark-test')
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'dayspark-test.appspot.com')
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789012')
    vi.stubEnv('VITE_FIREBASE_APP_ID', '123456789012:web:app-id')
    firestore.setDoc.mockResolvedValue(undefined)
  })

  afterEach(() => vi.unstubAllEnvs())

  it('writes a signed-in user profile and favorites to Firestore', async () => {
    const { syncUserData } = await import('./dbService')
    await syncUserData('user-1', {
      profile: { xp: 125, level: 2, currentStreak: 2, bestStreak: 2, lastActivityDate: '2026-09-10', completedChallenges: [], streakFreezes: 0, streakFreezeMilestonesClaimed: 0 },
      favorites: ['read', 'read'],
    })

    expect(firestore.getFirestore).toHaveBeenCalled()
    expect(firestore.setDoc).toHaveBeenCalledTimes(2)
    expect(firestore.setDoc).toHaveBeenCalledWith('users/user-1/profile/data', expect.objectContaining({ xp: 125 }), { merge: true })
    expect(firestore.setDoc).toHaveBeenCalledWith('users/user-1/favorites/data', { activityIds: ['read'] }, { merge: true })
  })

  it('falls back to local data when a Firestore migration fails', async () => {
    const { getLocalUserData, migrateLocalData } = await import('./dbService')
    firestore.getDoc.mockRejectedValueOnce(new Error('offline'))

    await expect(migrateLocalData('user-1')).resolves.toEqual(getLocalUserData())
  })
})
