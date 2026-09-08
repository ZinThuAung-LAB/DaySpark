import { fireEvent, render, screen, within } from '@testing-library/react'
import { activities } from './data/activities'
import {
  clearCompletedActivities,
  loadCompletedActivities,
  saveCompletedActivity,
} from './features/activityHistory/completed-activity-storage'
import {
  clearFavoriteActivityIds,
  loadFavoriteActivityIds,
} from './features/activityFavorites/favorite-activity-storage'
import { clearUserStats } from './features/gamification/services/gamificationService'
import App from './App'

function chooseAllPreferences() {
  fireEvent.click(screen.getByRole('radio', { name: 'Bored' }))
  fireEvent.click(within(screen.getByRole('group', { name: 'What is your energy level?' })).getByRole('radio', { name: 'Low' }))
  fireEvent.click(screen.getByRole('radio', { name: '10 minutes' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Free' }))
}

function choosePreferencesForRecommendations() {
  fireEvent.click(screen.getByRole('radio', { name: 'Productive' }))
  fireEvent.click(within(screen.getByRole('group', { name: 'What is your energy level?' })).getByRole('radio', { name: 'Medium' }))
  fireEvent.click(within(screen.getByRole('group', { name: 'How much time do you have?' })).getByRole('radio', { name: '30 minutes' }))
  fireEvent.click(within(screen.getByRole('group', { name: 'What is your budget?' })).getByRole('radio', { name: 'Low' }))
}

function saveCompletionFor(activityId: string, completionId: string) {
  const activity = activities.find((currentActivity) => currentActivity.id === activityId)

  if (!activity) {
    throw new Error(`Missing activity: ${activityId}`)
  }

  saveCompletedActivity({
    completionId,
    activityId: activity.id,
    activityTitle: activity.title,
    completedAt: '2026-09-08T08:00:00.000Z',
    xpReward: activity.xpReward,
  })
}

describe('App', () => {
  beforeEach(() => {
    clearCompletedActivities()
    clearFavoriteActivityIds()
    clearUserStats()
  })

  it('disables activity suggestions until every preference is selected', () => {
    render(<App />)

    const suggestButton = screen.getByRole('button', { name: 'Suggest Activities' })
    expect(suggestButton).toBeDisabled()

    chooseAllPreferences()

    expect(suggestButton).toBeEnabled()
  })

  it('keeps one selected value in each preference group', () => {
    render(<App />)

    const boredOption = screen.getByRole('radio', { name: 'Bored' })
    const relaxedOption = screen.getByRole('radio', { name: 'Relaxed' })
    fireEvent.click(boredOption)
    fireEvent.click(relaxedOption)

    expect(relaxedOption).toBeChecked()
    expect(boredOption).not.toBeChecked()
  })

  it('shows three activity cards after the form is submitted', () => {
    render(<App />)

    choosePreferencesForRecommendations()
    fireEvent.click(screen.getByRole('button', { name: 'Suggest Activities' }))

    expect(screen.getByRole('heading', { name: 'Your activity ideas' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(new Set(screen.getAllByRole('article').map((card) => card.getAttribute('aria-label'))).size).toBe(3)
  })

  it('completes an activity once and replaces it with another compatible activity', () => {
    render(<App />)

    choosePreferencesForRecommendations()
    fireEvent.click(screen.getByRole('button', { name: 'Suggest Activities' }))

    const firstCard = screen.getAllByRole('article')[0]
    const originalTitle = within(firstCard).getByRole('heading').textContent
    fireEvent.click(within(firstCard).getByRole('button', { name: 'Do This' }))

    const completedButton = within(firstCard).getByRole('button', { name: 'Completed' })
    expect(completedButton).toBeDisabled()
    expect(completedButton).toHaveAttribute('aria-pressed', 'true')
    expect(within(firstCard).getByText(/xp earned/i)).toBeInTheDocument()

    fireEvent.click(completedButton)
    expect(loadCompletedActivities()).toHaveLength(1)

    fireEvent.click(within(screen.getByLabelText('Try another activity')).getAllByRole('button', { name: 'Try Another' })[0])

    expect(screen.getByRole('status')).toHaveTextContent('Here is another compatible activity.')
    expect(screen.queryByRole('heading', { name: originalTitle ?? '' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('keeps a newly completed activity in persisted history when generating later suggestions', () => {
    render(<App />)

    choosePreferencesForRecommendations()
    fireEvent.click(screen.getByRole('button', { name: 'Suggest Activities' }))

    const firstCard = screen.getAllByRole('article')[0]
    fireEvent.click(within(firstCard).getByRole('button', { name: 'Do This' }))
    fireEvent.click(screen.getByRole('button', { name: 'Suggest Activities' }))

    expect(loadCompletedActivities()).toHaveLength(1)
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('awards XP and updates the gamification progress when an activity is completed', () => {
    render(<App />)

    choosePreferencesForRecommendations()
    fireEvent.click(screen.getByRole('button', { name: 'Suggest Activities' }))

    const firstCard = screen.getAllByRole('article')[0]
    const activityTitle = within(firstCard).getByRole('heading').textContent ?? ''
    const activity = activities.find((currentActivity) => currentActivity.title === activityTitle)

    if (!activity) {
      throw new Error(`Missing activity: ${activityTitle}`)
    }

    fireEvent.click(within(firstCard).getByRole('button', { name: 'Do This' }))

    expect(screen.getByText(`+${activity.xpReward} XP earned`)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'XP progress to next level' })).toHaveAttribute(
      'aria-valuenow',
      String(activity.xpReward % 100),
    )
  })

  it('continues to show activities when every compatible activity was already completed', () => {
    const compatibleActivities = activities.filter(
      (activity) => activity.energy === 'low' && activity.duration === '10-minutes' && activity.budget === 'free',
    )
    compatibleActivities.forEach((activity, index) => saveCompletionFor(activity.id, `completed-${index}`))

    render(<App />)

    chooseAllPreferences()
    fireEvent.click(screen.getByRole('button', { name: 'Suggest Activities' }))

    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('adds and removes a favorite immediately, with an accessible stateful control', () => {
    render(<App />)

    choosePreferencesForRecommendations()
    fireEvent.click(screen.getByRole('button', { name: 'Suggest Activities' }))

    const firstCard = screen.getAllByRole('article')[0]
    const activityTitle = within(firstCard).getByRole('heading').textContent ?? ''
    const favoriteButton = within(firstCard).getByRole('button', { name: `Add ${activityTitle} to favorites` })
    fireEvent.click(favoriteButton)

    expect(loadFavoriteActivityIds()).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Favorite activities' })).toBeInTheDocument()
    expect(within(firstCard).getByRole('button', { name: `Remove ${activityTitle} from favorites` })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(within(firstCard).getByRole('button', { name: `Remove ${activityTitle} from favorites` }))

    expect(loadFavoriteActivityIds()).toEqual([])
    expect(screen.getByText('You have no favorite activities yet. Save an idea from your recommendations to find it here.')).toBeInTheDocument()
  })

  it('loads persisted favorites after a new application render', () => {
    const activity = activities[0]
    window.localStorage.setItem('dayspark.favorite-activity-ids', JSON.stringify([activity.id]))

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Favorite activities' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: activity.title })).toBeInTheDocument()
  })
})
