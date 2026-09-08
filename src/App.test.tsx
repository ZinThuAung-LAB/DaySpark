import { fireEvent, render, screen, within } from '@testing-library/react'
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

describe('App', () => {
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
  })

  it('marks an activity selected and replaces it with another compatible activity', () => {
    render(<App />)

    choosePreferencesForRecommendations()
    fireEvent.click(screen.getByRole('button', { name: 'Suggest Activities' }))

    const firstCard = screen.getAllByRole('article')[0]
    const originalTitle = within(firstCard).getByRole('heading').textContent
    fireEvent.click(within(firstCard).getByRole('button', { name: 'Do This' }))

    expect(within(firstCard).getByRole('button', { name: 'Selected' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(within(firstCard).getByRole('button', { name: 'Try Another' }))

    expect(screen.getByRole('status')).toHaveTextContent('Here is another compatible activity.')
    expect(screen.queryByRole('heading', { name: originalTitle ?? '' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })
})
