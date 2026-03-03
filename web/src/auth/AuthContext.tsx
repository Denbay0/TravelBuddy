import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../services/authService'
import type { ApiUser } from '../types/api'

type AuthContextValue = {
  user: ApiUser | null
  isLoading: boolean
  setUser: (user: ApiUser | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      try {
        const authenticatedUser = await authService.me()
        setUser(authenticatedUser)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      setUser,
      logout: async () => {
        await authService.logout()
        setUser(null)
      },
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
