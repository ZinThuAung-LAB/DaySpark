import { fireEvent, render, screen } from '@testing-library/react'
import type { Activity } from '../types/activity'
import { RecommendationCard } from './RecommendationCard'

const activity: Activity = {
  id: 'stretch', title: 'Five-minute stretch', description: 'Move a little.',
  moods: ['productive'], energy: 'low', duration: '10-minutes', budget: 'free', category: 'fitness', xpReward: 10,
}

describe('RecommendationCard actions', () => {
  it('runs Do This and favorite actions, then exposes the completed state', () => {
    const onDoThis = vi.fn()
    const onToggleFavorite = vi.fn()
    const { rerender } = render(<RecommendationCard activity={activity} completedActivity={undefined} isFavorite={false} onDoThis={onDoThis} onToggleFavorite={onToggleFavorite} />)

    fireEvent.click(screen.getByRole('button', { name: 'Do This' }))
    fireEvent.click(screen.getByRole('button', { name: `Add ${activity.title} to favorites` }))
    expect(onDoThis).toHaveBeenCalledWith(activity.id)
    expect(onToggleFavorite).toHaveBeenCalledTimes(1)

    rerender(<RecommendationCard activity={activity} completedActivity={{ completionId: 'done', activityId: activity.id, activityTitle: activity.title, completedAt: '2026-09-10T00:00:00.000Z', xpReward: 10 }} isFavorite onDoThis={onDoThis} onToggleFavorite={onToggleFavorite} />)
    expect(screen.getByRole('button', { name: 'Completed' })).toBeDisabled()
    expect(screen.getByRole('button', { name: `Remove ${activity.title} from favorites` })).toHaveAttribute('aria-pressed', 'true')
  })
})
