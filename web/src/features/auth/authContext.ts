import { createContext } from 'react'
import type { ApiUser } from '../../types/api'

export type AuthContextValue = {
  user: ApiUser | null
  isAuthResolved: boolean
  setAuthenticatedUser: (user: ApiUser) => void
  clearAuthenticatedUser: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
