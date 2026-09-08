import { render, screen } from '@testing-library/react'
import { RecentCompletions } from './RecentCompletions'
import type { CompletedActivity } from './types'

const completions: CompletedActivity[] = Array.from({ length: 6 }, (_, index) => ({
  completionId: `completion-${index + 1}`,
  activityId: `activity-${index + 1}`,
  activityTitle: `Activity ${index + 1}`,
  completedAt: `2026-09-0${index + 1}T08:00:00.000Z`,
  xpReward: 10,
}))

describe('RecentCompletions', () => {
  it('displays only the five most recent completed activities', () => {
    render(<RecentCompletions completedActivities={completions} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('Activity 6')).toBeInTheDocument()
    expect(screen.queryByText('Activity 1')).not.toBeInTheDocument()
  })
})
