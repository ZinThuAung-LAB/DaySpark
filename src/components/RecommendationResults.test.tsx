import { fireEvent, render, screen } from '@testing-library/react'
import type { Activity } from '../types/activity'
import { RecommendationResults } from './RecommendationResults'

const activity: Activity = {
  id: 'read', title: 'Read a chapter', description: 'Read.', moods: ['relaxed'], energy: 'low', duration: '30-minutes', budget: 'free', category: 'learning', xpReward: 15,
}

describe('RecommendationResults', () => {
  it('routes Try Another to the card it replaces', () => {
    const onTryAnother = vi.fn()
    render(<RecommendationResults activities={[activity]} emptyMessage={null} message={null} isFavorite={() => false} onDoThis={vi.fn()} onToggleFavorite={vi.fn()} onTryAnother={onTryAnother} getCompletion={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'Try Another' }))
    expect(onTryAnother).toHaveBeenCalledWith(activity.id)
  })
})
