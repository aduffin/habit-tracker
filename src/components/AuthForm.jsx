import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

export default function AuthForm({ mode, user }) {
  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('Your password must be at least 6 characters long.')
      return
    }

    setSubmitting(true)
    const result = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)

    if (result.error) {
      const text = result.error.message.toLowerCase()
      if (text.includes('invalid login credentials')) {
        setError('The email or password is incorrect.')
      } else if (text.includes('already registered')) {
        setError('An account with this email already exists. Try logging in.')
      } else {
        setError(result.error.message)
      }
      return
    }

    if (isSignup && !result.data.session) {
      setMessage('Check your email for a confirmation link, then log in.')
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="auth-title">
        <p className="eyebrow">HABIT TRACKER</p>
        <h1 id="auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="intro">
          {isSignup ? 'A little progress, made personal.' : 'Log in to continue.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />

          {error && <p className="form-message error" role="alert">{error}</p>}
          {message && <p className="form-message" role="status">{message}</p>}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="switch-page">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <Link to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  )
}