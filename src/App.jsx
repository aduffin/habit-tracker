import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'

function AuthPage({ mode, user }) {
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

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />
}

function Dashboard({ user }) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <main className="dashboard-layout">
      <section className="dashboard-panel">
        <p className="eyebrow">HABIT TRACKER</p>
        <h1>Your dashboard</h1>
        <p className="intro">Logged in as <strong>{user.email}</strong></p>
        <button className="secondary-button" type="button" onClick={handleLogout}>
          Log out
        </button>
      </section>
    </main>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <main className="auth-layout">
        <section className="auth-panel">
          <p className="eyebrow">HABIT TRACKER</p>
          <h1>Connect Supabase</h1>
          <p className="intro">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_KEY to your local .env file, then restart Vite.
          </p>
        </section>
      </main>
    )
  }

  if (loading) return <p className="loading">Loading...</p>

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={<AuthPage mode="login" user={user} />} />
      <Route path="/signup" element={<AuthPage mode="signup" user={user} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}