import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export function GuestOnlyRoute() {
  const { user, isAuthResolved } = useAuth()

  if (!isAuthResolved) {
    return null
  }

  if (user) {
    return <Navigate to="/profile" replace />
  }

  return <Outlet />
}
