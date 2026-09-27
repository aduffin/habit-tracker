import { Navigate, Outlet } from 'react-router-dom'
import NavigationBar from './NavigationBar.jsx'

export default function ProtectedRoute({ user }) {
  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <NavigationBar />
      <Outlet />
    </>
  )
}