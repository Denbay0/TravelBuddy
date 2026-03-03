import { apiRequest } from '../lib/api'
import type { ApiUser } from '../types/api'

export const profileService = {
  async me(): Promise<ApiUser> {
    return apiRequest<ApiUser>('/profile/me')
  },
}
