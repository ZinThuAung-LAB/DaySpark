import { render, screen } from '@testing-library/react'
import { GamificationHeader } from './GamificationHeader'

describe('GamificationHeader', () => {
  it('renders the calculated XP progress accessibly', () => {
    render(
      <GamificationHeader
        currentStreak={4}
        didLevelUp={false}
        lastXPReward={null}
        level={2}
        progressPercentage={50}
        xpIntoCurrentLevel={50}
        xpToNextLevel={100}
      />,
    )

    expect(screen.getByRole('progressbar', { name: 'XP progress to next level' })).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByText('50 / 100 XP')).toBeInTheDocument()
    expect(screen.getByLabelText('4 day streak')).toBeInTheDocument()
  })
})
