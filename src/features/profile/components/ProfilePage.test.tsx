import { fireEvent, render, screen } from '@testing-library/react'
import type { UserProfile } from '../../auth/types/auth'
import { initialUserStats } from '../../../features/gamification/services/gamificationService'
import { ProfilePage } from './ProfilePage'

const user: UserProfile = {
  uid: 'user-1',
  email: 'hello@dayspark.test',
  displayName: 'Day Spark',
  photoURL: null,
  createdAt: '2026-09-08T00:00:00.000Z',
}

function renderProfile() {
  const onSaveProfile = vi.fn().mockResolvedValue(undefined)
  const onClearLocalData = vi.fn()
  render(
    <ProfilePage
      completedActivitiesCount={8}
      completedActivities={[]}
      customActivitiesCount={0}
      favoritesCount={3}
      loading={false}
      onClearLocalData={onClearLocalData}
      onDeleteData={vi.fn().mockResolvedValue(undefined)}
      onResync={vi.fn().mockResolvedValue(undefined)}
      onSaveProfile={onSaveProfile}
      onSignOut={vi.fn().mockResolvedValue(undefined)}
      onUnlockStreakFreeze={vi.fn(() => true)}
      stats={{ ...initialUserStats, xp: 125, level: 2, currentStreak: 4, bestStreak: 7 }}
      user={user}
    />,
  )
  return { onClearLocalData, onSaveProfile }
}

describe('ProfilePage', () => {
  it('renders account, progress, and activity summaries', () => {
    renderProfile()

    expect(screen.getByRole('heading', { name: 'Profile and settings' })).toBeInTheDocument()
    expect(screen.getByText('hello@dayspark.test')).toBeInTheDocument()
    expect(screen.getByText('125')).toBeInTheDocument()
    expect(screen.getByText('Completed activities')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('saves accessible profile setting fields and clears the local cache', async () => {
    const { onClearLocalData, onSaveProfile } = renderProfile()

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'New Day' } })
    fireEvent.change(screen.getByLabelText('Avatar image URL'), { target: { value: 'https://example.test/avatar.png' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Profile updated.')

    expect(onSaveProfile).toHaveBeenCalledWith('New Day', 'https://example.test/avatar.png')
    fireEvent.click(screen.getByRole('button', { name: 'Clear local cache' }))
    expect(onClearLocalData).toHaveBeenCalledOnce()
  })
})
