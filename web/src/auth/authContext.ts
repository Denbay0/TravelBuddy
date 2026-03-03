import { createContext } from 'react'
import type { ApiUser } from '../types/api'

export type AuthContextValue = {
  user: ApiUser | null
  isLoading: boolean
  setUser: (user: ApiUser | null) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
