import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ApiUser } from '../../../types/api'
import { adminAuthService } from '../../../services/adminAuthService'
import { AdminAuthContext, type AdminAuthContextValue } from './adminAuthContext'

type Props = { children: ReactNode }

export function AdminAuthProvider({ children }: Props) {
  const [admin, setAdmin] = useState<ApiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = async () => {
    try {
      const currentAdmin = await adminAuthService.me()
      setAdmin(currentAdmin)
    } catch {
      setAdmin(null)
    }
  }

  useEffect(() => {
    void refresh().finally(() => setIsLoading(false))
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      isLoading,
      refresh,
      login: async (payload) => {
        const response = await adminAuthService.login(payload)
        setAdmin(response.user)
      },
      logout: async () => {
        await adminAuthService.logout()
        setAdmin(null)
      },
    }),
    [admin, isLoading],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
