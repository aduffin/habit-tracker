import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    async function loadHabits() {
      setLoading(true)
      setError('')

      try {
        const { data, error: queryError } = await supabase
          .from('habits')
          .select('id, name, description, weekly_goal, color')
          .order('created_at', { ascending: true })

        if (queryError) throw queryError
        setHabits(data ?? [])
      } catch (loadError) {
        setError(loadError.message || 'Could not load your habits. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadHabits()
  }, [])

  async function deleteHabit(habit) {
    const confirmed = window.confirm(
      `Delete "${habit.name}"? This also deletes its completion history. This cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingId(habit.id)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('habits')
        .delete()
        .eq('id', habit.id)

      if (deleteError) throw deleteError
      setHabits((currentHabits) => currentHabits.filter((item) => item.id !== habit.id))
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete this habit. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="page-layout">
      <section className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">HABIT TRACKER</p>
            <h1>Your habits</h1>
          </div>
          <Link className="primary-button add-habit-button" to="/habits/new">
            Add habit
          </Link>
        </div>

        {error && <p className="page-error" role="alert">{error}</p>}
        {loading && <p className="page-status" role="status">Loading habits...</p>}
        {!loading && !error && habits.length === 0 && (
          <p className="page-status">You haven't added any habits yet.</p>
        )}

        {!loading && habits.length > 0 && (
          <ul className="habit-list">
            {habits.map((habit) => (
              <li className="habit-row" key={habit.id}>
                <span
                  className="habit-color-marker"
                  style={{ backgroundColor: habit.color }}
                  aria-label={`Color ${habit.color}`}
                />
                <div className="habit-details">
                  <h2>{habit.name}</h2>
                  {habit.description && <p>{habit.description}</p>}
                  <span className="habit-goal">Goal: {habit.weekly_goal}x per week</span>
                </div>
                <div className="habit-actions">
                  <Link className="secondary-button" to={`/habits/${habit.id}/edit`}>
                    Edit
                  </Link>
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteHabit(habit)}
                    disabled={deletingId === habit.id}
                  >
                    {deletingId === habit.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}