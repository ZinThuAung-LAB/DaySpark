import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the DaySpark placeholder homepage', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /find a good way/i })).toBeInTheDocument()
  })
})
