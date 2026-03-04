import { apiRequest, clearCsrfTokenCache } from '../lib/api'
import type { ApiUser, LoginResponse, LogoutResponse } from '../types/api'

export const adminAuthService = {
  async login(payload: { login: string; password: string }): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/api/admin/auth/login', {
      method: 'POST',
      body: payload,
      skipCsrf: true,
    })
  },

  async me(): Promise<ApiUser> {
    return apiRequest<ApiUser>('/api/admin/auth/me')
  },

  async logout(): Promise<LogoutResponse> {
    const response = await apiRequest<LogoutResponse>('/api/admin/auth/logout', { method: 'POST' })
    clearCsrfTokenCache()
    return response
  },
}
