import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

const colors = [
  { name: 'Red', value: '#e05252' },
  { name: 'Orange', value: '#e67e22' },
  { name: 'Yellow', value: '#d4a017' },
  { name: 'Green', value: '#2d9c5b' },
  { name: 'Teal', value: '#00a6a6' },
  { name: 'Blue', value: '#3b82c4' },
  { name: 'Purple', value: '#7656b3' },
  { name: 'Pink', value: '#d65399' },
]

export default function HabitForm() {
  const { id: habitId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(habitId)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [weeklyGoal, setWeeklyGoal] = useState('')
  const [color, setColor] = useState('')
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return undefined

    async function loadHabit() {
      try {
        const { data, error: queryError } = await supabase
          .from('habits')
          .select('name, description, weekly_goal, color')
          .eq('id', habitId)
          .single()

        if (queryError) throw queryError
        setName(data.name)
        setDescription(data.description ?? '')
        setWeeklyGoal(String(data.weekly_goal))
        setColor(data.color)
      } catch (loadError) {
        setError(loadError.message || 'Could not load this habit. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadHabit()
    return undefined
  }, [habitId, isEditing])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const goal = Number(weeklyGoal)
    if (!Number.isInteger(goal) || goal < 1 || goal > 7) {
      setError('Weekly goal must be a whole number from 1 to 7.')
      return
    }
    if (!color) {
      setError('Choose a color for this habit.')
      return
    }

    const habitValues = {
      name: name.trim(),
      description: description.trim() || null,
      weekly_goal: goal,
      color,
    }

    setSaving(true)
    try {
      const result = isEditing
        ? await supabase.from('habits').update(habitValues).eq('id', habitId)
        : await supabase.from('habits').insert(habitValues)

      if (result.error) throw result.error
      navigate('/habits', { replace: true })
    } catch (saveError) {
      setError(saveError.message || 'Could not save this habit. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="page-status" role="status">Loading habit...</p>
  }

  return (
    <main className="page-layout">
      <section className="habit-form-panel">
        <p className="eyebrow">HABIT TRACKER</p>
        <h1>{isEditing ? 'Edit habit' : 'Add a habit'}</h1>

        {error && <p className="page-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="habit-name">Name</label>
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label htmlFor="habit-description">Description (optional)</label>
          <textarea
            id="habit-description"
            rows="3"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <label htmlFor="weekly-goal">Weekly goal</label>
          <div className="goal-input-row">
            <input
              id="weekly-goal"
              type="number"
              min="1"
              max="7"
              step="1"
              value={weeklyGoal}
              onChange={(event) => setWeeklyGoal(event.target.value)}
              required
            />
            <span>times per week</span>
          </div>

          <fieldset className="color-picker">
            <legend>Color</legend>
            <div className="color-options">
              {colors.map((option, index) => (
                <label className="color-option" key={option.value}>
                  <input
                    type="radio"
                    name="habit-color"
                    value={option.value}
                    checked={color === option.value}
                    onChange={() => setColor(option.value)}
                    required={index === 0}
                  />
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: option.value }}
                    title={option.name}
                  />
                  <span className="color-name">{option.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save habit'}
            </button>
            <Link className="cancel-link" to="/habits">Cancel</Link>
          </div>
        </form>
      </section>
    </main>
  )
}