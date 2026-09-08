import { fireEvent, render, screen } from '@testing-library/react'
import type { DailyChallenge } from '../../../types/gamification'
import { DailyChallengeCard } from './DailyChallengeCard'

const challenge: DailyChallenge = {
  id: 'daily-challenge',
  title: 'Learn something new',
  description: 'Discover a useful fact.',
  xpReward: 20,
  completedDate: null,
}

describe('DailyChallengeCard', () => {
  it('moves from starting to completing a challenge and updates when completed', () => {
    const onComplete = vi.fn()
    const { rerender } = render(<DailyChallengeCard challenge={challenge} onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start Challenge' }))
    fireEvent.click(screen.getByRole('button', { name: 'Complete Challenge' }))

    expect(onComplete).toHaveBeenCalledOnce()

    rerender(<DailyChallengeCard challenge={{ ...challenge, completedDate: '2026-09-08' }} onComplete={onComplete} />)

    expect(screen.getByRole('status')).toHaveTextContent('Challenge completed today')
    expect(screen.queryByRole('button', { name: /challenge/i })).not.toBeInTheDocument()
  })
})
