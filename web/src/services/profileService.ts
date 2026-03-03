import { apiRequest } from '../lib/api'
import type { ApiProfile, ApiProfileFavoriteRoute, ApiProfilePost, ProfilePageResponse } from '../types/api'

type ProfileUpdatePayload = Partial<Pick<ApiProfile, 'name' | 'travelTagline' | 'bio' | 'homeCity'>>

export const profileService = {
  async me(): Promise<ApiProfile> {
    return apiRequest<ApiProfile>('/profile/me')
  },

  async updateMe(payload: ProfileUpdatePayload): Promise<{ message: string; profile: ApiProfile }> {
    return apiRequest<{ message: string; profile: ApiProfile }>('/profile/me', {
      method: 'PATCH',
      body: payload,
    })
  },

  async uploadAvatar(file: File): Promise<{ message: string; avatarUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return apiRequest<{ message: string; avatarUrl: string }>('/profile/avatar', {
      method: 'POST',
      body: formData,
    })
  },

  async resetAvatar(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/profile/avatar', { method: 'DELETE' })
  },

  async myPosts(page = 1, limit = 12): Promise<ProfilePageResponse<ApiProfilePost>> {
    return apiRequest<ProfilePageResponse<ApiProfilePost>>(`/profile/me/posts?page=${page}&limit=${limit}`)
  },

  async myFavoriteRoutes(page = 1, limit = 12): Promise<ProfilePageResponse<ApiProfileFavoriteRoute>> {
    return apiRequest<ProfilePageResponse<ApiProfileFavoriteRoute>>(`/profile/me/favorite-routes?page=${page}&limit=${limit}`)
  },
}
