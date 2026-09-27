import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import {
  addLocalDays,
  formatLocalDate,
  getLocalWeekRange,
  parseLocalDate,
} from '../utils/localDates.js'

export default function Dashboard() {
  const [viewedDate, setViewedDate] = useState(() => formatLocalDate(new Date()))
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingHabitIds, setUpdatingHabitIds] = useState(new Set())
  const updatingIds = useRef(new Set())

  const todayDate = formatLocalDate(new Date())
  const selectedDate = parseLocalDate(viewedDate)
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(selectedDate)
  const isToday = viewedDate === todayDate
  const isFuture = viewedDate > todayDate

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')
      const { startDate, endDate } = getLocalWeekRange(viewedDate)

      try {
        const [habitsResult, completionsResult] = await Promise.all([
          supabase
            .from('habits')
            .select('id, name, color, weekly_goal')
            .order('created_at', { ascending: true }),
          supabase
            .from('completions')
            .select('habit_id, completed_on')
            .gte('completed_on', startDate)
            .lte('completed_on', endDate),
        ])

        if (habitsResult.error) throw habitsResult.error
        if (completionsResult.error) throw completionsResult.error

        setHabits(habitsResult.data ?? [])
        setCompletions(completionsResult.data ?? [])
      } catch (loadError) {
        setError(loadError.message || 'Could not load your dashboard. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [viewedDate])

  async function toggleCompletion(habit, shouldBeChecked) {
    if (isFuture || updatingIds.current.has(habit.id)) return

    updatingIds.current.add(habit.id)
    setUpdatingHabitIds(new Set(updatingIds.current))
    setError('')

    try {
      const result = shouldBeChecked
        ? await supabase.from('completions').insert({
          habit_id: habit.id,
          completed_on: viewedDate,
        })
        : await supabase
          .from('completions')
          .delete()
          .eq('habit_id', habit.id)
          .eq('completed_on', viewedDate)

      if (result.error && !(shouldBeChecked && result.error.code === '23505')) {
        throw result.error
      }

      setCompletions((currentCompletions) => {
        const alreadyComplete = currentCompletions.some(
          (completion) => completion.habit_id === habit.id
            && completion.completed_on === viewedDate,
        )

        if (shouldBeChecked && !alreadyComplete) {
          return [...currentCompletions, { habit_id: habit.id, completed_on: viewedDate }]
        }

        if (!shouldBeChecked) {
          return currentCompletions.filter(
            (completion) => completion.habit_id !== habit.id
              || completion.completed_on !== viewedDate,
          )
        }

        return currentCompletions
      })
    } catch (updateError) {
      setError(updateError.message || `Could not update ${habit.name}. Please try again.`)
    } finally {
      updatingIds.current.delete(habit.id)
      setUpdatingHabitIds(new Set(updatingIds.current))
    }
  }

  function changeDay(amount) {
    const nextDate = addLocalDays(viewedDate, amount)
    if (nextDate <= todayDate) setViewedDate(nextDate)
  }

  return (
    <main className="dashboard-layout">
      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">HABIT TRACKER</p>
            <h1>{dateLabel}</h1>
          </div>
          <div className="day-navigation" aria-label="Choose a day">
            <button className="secondary-button" type="button" onClick={() => changeDay(-1)}>
              Previous day
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setViewedDate(todayDate)}
              disabled={isToday}
            >
              Today
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => changeDay(1)}
              disabled={isToday || isFuture}
            >
              Next day
            </button>
          </div>
        </div>

        {error && <p className="dashboard-error" role="alert">{error}</p>}
        {loading && <p className="dashboard-message" role="status">Loading your habits...</p>}
        {!loading && !error && habits.length === 0 && (
          <p className="dashboard-message">
            You don't have any habits yet. <Link to="/habits">Add a habit</Link> to get started.
          </p>
        )}

        {!loading && habits.length > 0 && (
          <ul className="dashboard-habit-list">
            {habits.map((habit) => {
              const weeklyCount = completions.filter(
                (completion) => completion.habit_id === habit.id,
              ).length
              const isComplete = completions.some(
                (completion) => completion.habit_id === habit.id
                  && completion.completed_on === viewedDate,
              )
              const goalReached = weeklyCount >= habit.weekly_goal

              return (
                <li className="dashboard-habit-row" key={habit.id}>
                  <span
                    className="dashboard-color-marker"
                    style={{ backgroundColor: habit.color }}
                    aria-hidden="true"
                  />
                  <div className="dashboard-habit-info">
                    <h2>{habit.name}</h2>
                    <div className="dashboard-progress">
                      <span>{weeklyCount}/{habit.weekly_goal} this week</span>
                      {goalReached && <span className="goal-reached">Goal met</span>}
                    </div>
                  </div>
                  <label className="completion-control">
                    <input
                      type="checkbox"
                      aria-label={`Mark ${habit.name} complete for ${dateLabel}`}
                      checked={isComplete}
                      disabled={isFuture || updatingHabitIds.has(habit.id)}
                      onChange={(event) => toggleCompletion(habit, event.target.checked)}
                    />
                    <span>Done</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}