import { render, screen } from '@testing-library/react'
import { activities } from '../../data/activities'
import { FavoriteActivities } from './FavoriteActivities'

const noCompletion = () => undefined
const noAction = () => undefined

describe('FavoriteActivities', () => {
  it('shows an empty state when there are no favorites', () => {
    render(
      <FavoriteActivities
        activities={activities}
        favoriteActivityIds={[]}
        getCompletion={noCompletion}
        onDoThis={noAction}
        onUnfavorite={noAction}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Favorite activities' })).toBeInTheDocument()
    expect(screen.getByText('You have no favorite activities yet. Save an idea from your recommendations to find it here.')).toBeInTheDocument()
  })

  it('ignores stale favorite IDs and displays matching catalog activities', () => {
    render(
      <FavoriteActivities
        activities={activities}
        favoriteActivityIds={['missing-activity', 'five-minute-stretch']}
        getCompletion={noCompletion}
        onDoThis={noAction}
        onUnfavorite={noAction}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Do a five-minute stretch' })).toBeInTheDocument()
    expect(screen.queryByText('missing-activity')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Do a five-minute stretch from favorites' })).toHaveAttribute('aria-pressed', 'true')
  })
})
