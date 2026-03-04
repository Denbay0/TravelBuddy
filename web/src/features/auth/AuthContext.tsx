import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../../services/authService'
import type { ApiUser } from '../../types/api'
import { AuthContext, type AuthContextValue } from './authContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isAuthResolved, setIsAuthResolved] = useState(false)

  useEffect(() => {
    async function restoreSession() {
      try {
        const authenticatedUser = await authService.me()
        setUser(authenticatedUser)
      } catch {
        setUser(null)
      } finally {
        setIsAuthResolved(true)
      }
    }

    void restoreSession()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthResolved,
      setAuthenticatedUser: (authenticatedUser) => setUser(authenticatedUser),
      clearAuthenticatedUser: () => setUser(null),
    }),
    [isAuthResolved, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
