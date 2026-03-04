import { apiRequest, clearCsrfTokenCache } from '../lib/api'
import type { ApiUser, LoginResponse, LogoutResponse } from '../types/api'

export const adminAuthService = {
  async login(payload: { email: string; password: string }): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/admin/auth/login', {
      method: 'POST',
      body: payload,
      skipCsrf: true,
    })
  },

  async me(): Promise<ApiUser> {
    return apiRequest<ApiUser>('/admin/auth/me')
  },

  async logout(): Promise<LogoutResponse> {
    const response = await apiRequest<LogoutResponse>('/admin/auth/logout', { method: 'POST' })
    clearCsrfTokenCache()
    return response
  },
}
