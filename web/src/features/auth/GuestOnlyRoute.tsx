import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

export function GuestOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (user) {
    return <Navigate to="/profile" replace />
  }

  return <Outlet />
}
