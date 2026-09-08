import { fireEvent, render, screen } from '@testing-library/react'
import { AuthModal } from './AuthModal'

describe('AuthModal', () => {
  it('validates email and password before submitting', () => {
    const onLogin = vi.fn()
    render(<AuthModal error={null} loading={false} onClose={vi.fn()} onLogin={onLogin} onSignUp={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
    expect(onLogin).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'hello@dayspark.test' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 6 characters.')
  })

  it('submits valid sign-up credentials', async () => {
    const onSignUp = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<AuthModal error={null} loading={false} onClose={onClose} onLogin={vi.fn()} onSignUp={onSignUp} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Sign Up' }))
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'hello@dayspark.test' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await Promise.resolve()

    expect(onSignUp).toHaveBeenCalledWith('hello@dayspark.test', 'password')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
