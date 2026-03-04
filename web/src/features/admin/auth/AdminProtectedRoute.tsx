import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'

export default function AdminProtectedRoute() {
  const { admin, isLoading } = useAdminAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="p-8 text-sm text-ink/70">Проверяем доступ администратора...</div>
  }

  if (!admin?.isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
