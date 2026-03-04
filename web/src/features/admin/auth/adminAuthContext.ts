import { createContext } from 'react'
import type { ApiUser } from '../../../types/api'

export type AdminAuthContextValue = {
  admin: ApiUser | null
  isLoading: boolean
  login: (payload: { login: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)
