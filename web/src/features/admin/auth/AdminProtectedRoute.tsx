import { Outlet } from 'react-router-dom'
import type { AdminAccessRequirement, AdminAuthState } from './types'

type AdminProtectedRouteProps = {
  requirement?: AdminAccessRequirement
}

const placeholderAdminAuthState: AdminAuthState = {
  isAuthenticated: true,
  role: 'super_admin',
}

export default function AdminProtectedRoute({ requirement }: AdminProtectedRouteProps) {
  void requirement
  void placeholderAdminAuthState

  // Pass-through seam for now.
  // In a later iteration, replace this return with role-based checks and redirect
  // unauthenticated or unauthorized users to /admin/login (or another entrypoint).
  return <Outlet />
}
