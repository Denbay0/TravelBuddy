import { apiRequest } from '../lib/api'
import type { ApiProfile, ApiProfileFavoriteRoute, ApiProfilePost, ProfilePageResponse } from '../types/api'

export const profileService = {
  async me(): Promise<ApiProfile> {
    return apiRequest<ApiProfile>('/profile/me')
  },

  async myPosts(page = 1, limit = 12): Promise<ProfilePageResponse<ApiProfilePost>> {
    return apiRequest<ProfilePageResponse<ApiProfilePost>>(`/profile/me/posts?page=${page}&limit=${limit}`)
  },

  async myFavoriteRoutes(page = 1, limit = 12): Promise<ProfilePageResponse<ApiProfileFavoriteRoute>> {
    return apiRequest<ProfilePageResponse<ApiProfileFavoriteRoute>>(`/profile/me/favorite-routes?page=${page}&limit=${limit}`)
  },
}
