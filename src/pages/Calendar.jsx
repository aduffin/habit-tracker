import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import {
  addLocalMonths,
  formatLocalDate,
  getLocalMonthGrid,
  getLocalMonthRange,
  parseLocalDate,
} from '../utils/localDates.js'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const [viewedMonth, setViewedMonth] = useState(() => {
    const today = formatLocalDate(new Date())
    return `${today.slice(0, 7)}-01`
  })
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [selectedHabitId, setSelectedHabitId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentMonth = formatLocalDate(new Date()).slice(0, 7)
  const viewedMonthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(parseLocalDate(viewedMonth))
  const { startDate, endDate } = getLocalMonthRange(viewedMonth)
  const monthGrid = getLocalMonthGrid(viewedMonth)
  const todayDate = formatLocalDate(new Date())

  useEffect(() => {
    let isCurrentRequest = true

    async function loadCalendar() {
      setLoading(true)
      setError('')

      try {
        const [habitsResult, completionsResult] = await Promise.all([
          supabase
            .from('habits')
            .select('id, name, color')
            .order('created_at', { ascending: true }),
          supabase
            .from('completions')
            .select('id, habit_id, completed_on, habit:habits(name, color)')
            .gte('completed_on', startDate)
            .lte('completed_on', endDate)
            .order('completed_on', { ascending: true }),
        ])

        if (habitsResult.error) throw habitsResult.error
        if (completionsResult.error) throw completionsResult.error

        if (isCurrentRequest) {
          setHabits(habitsResult.data ?? [])
          setCompletions(completionsResult.data ?? [])
        }
      } catch (loadError) {
        if (isCurrentRequest) {
          setError(loadError.message || 'Could not load the calendar. Please try again.')
        }
      } finally {
        if (isCurrentRequest) setLoading(false)
      }
    }

    loadCalendar()
    return () => {
      isCurrentRequest = false
    }
  }, [startDate, endDate])

  const completionsByDate = new Map()
  for (const completion of completions) {
    if (selectedHabitId && completion.habit_id !== selectedHabitId) continue
    if (!completion.habit) continue

    const dateCompletions = completionsByDate.get(completion.completed_on) ?? []
    dateCompletions.push(completion)
    completionsByDate.set(completion.completed_on, dateCompletions)
  }

  function changeMonth(amount) {
    const nextMonth = addLocalMonths(viewedMonth, amount)
    if (nextMonth.slice(0, 7) <= currentMonth) setViewedMonth(nextMonth)
  }

  return (
    <main className="page-layout">
      <section className="page-content calendar-page">
        <div className="calendar-heading">
          <div>
            <p className="eyebrow">HABIT TRACKER</p>
            <h1>{viewedMonthLabel}</h1>
          </div>
          <div className="month-navigation" aria-label="Choose a month">
            <button className="secondary-button" type="button" onClick={() => changeMonth(-1)}>
              Previous month
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => changeMonth(1)}
              disabled={viewedMonth.slice(0, 7) === currentMonth}
            >
              Next month
            </button>
          </div>
        </div>

        {habits.length > 0 && (
          <div className="calendar-filter">
            <label htmlFor="habit-filter">Show</label>
            <select
              id="habit-filter"
              value={selectedHabitId}
              onChange={(event) => setSelectedHabitId(event.target.value)}
            >
              <option value="">All habits</option>
              {habits.map((habit) => (
                <option value={habit.id} key={habit.id}>{habit.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="page-error" role="alert">{error}</p>}
        {loading && <p className="page-status" role="status">Loading calendar...</p>}
        {!loading && !error && habits.length === 0 && (
          <p className="page-status">
            You don't have any habits yet. <Link to="/habits">Add a habit</Link> to see it here.
          </p>
        )}

        {!loading && !error && habits.length > 0 && (
          <>
            <div className="calendar-grid" role="grid" aria-label={`${viewedMonthLabel} calendar`}>
              <div className="calendar-weekday-row" role="row">
                {weekdays.map((weekday) => (
                  <div className="calendar-weekday" role="columnheader" key={weekday}>
                    {weekday}
                  </div>
                ))}
              </div>
              {monthGrid.map((week, weekIndex) => (
                <div className="calendar-week" role="row" key={weekIndex}>
                  {week.map((date, dayIndex) => {
                    const isToday = date === todayDate
                    const dayCompletions = date ? completionsByDate.get(date) ?? [] : []

                    return (
                      <div
                        className={`calendar-day${date ? '' : ' calendar-day-blank'}${isToday ? ' calendar-day-today' : ''}`}
                        role="gridcell"
                        aria-label={date ? parseLocalDate(date).toLocaleDateString() : undefined}
                        key={`${weekIndex}-${dayIndex}`}
                      >
                        {date && (
                          <>
                            <span className="calendar-day-number">{parseLocalDate(date).getDate()}</span>
                            <div className="calendar-completions">
                              {dayCompletions.map((completion) => (
                                <span
                                  className="calendar-completion"
                                  key={completion.id}
                                  title={completion.habit.name}
                                  aria-label={completion.habit.name}
                                  style={{ backgroundColor: completion.habit.color }}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="calendar-legend" aria-label="Habit colors">
              <h2>Habits</h2>
              <ul>
                {habits.map((habit) => (
                  <li key={habit.id}>
                    <span className="calendar-legend-color" style={{ backgroundColor: habit.color }} />
                    <span>{habit.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>
    </main>
  )
}