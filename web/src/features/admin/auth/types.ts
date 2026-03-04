export type AdminRole = 'super_admin' | 'editor' | 'support'

export type AdminAuthState = {
  isAuthenticated: boolean
  role: AdminRole | null
}

export type AdminAccessRequirement = {
  allowedRoles?: AdminRole[]
}
