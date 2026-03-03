import { apiRequest, clearCsrfTokenCache } from '../lib/api'
import type { ApiUser, LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse } from '../types/api'

export const authService = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    })
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    })
  },

  async me(): Promise<ApiUser> {
    return apiRequest<ApiUser>('/auth/me')
  },

  async logout(): Promise<LogoutResponse> {
    const response = await apiRequest<LogoutResponse>('/auth/logout', {
      method: 'POST',
    })

    clearCsrfTokenCache()
    return response
  },
}
