import { NavLink } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

export default function NavigationBar() {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <span className="nav-brand">HABIT TRACKER</span>
      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/habits">Habits</NavLink>
        <NavLink to="/calendar">Calendar</NavLink>
        <button className="nav-logout" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  )
}