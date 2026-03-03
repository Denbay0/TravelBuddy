import { apiRequest } from '../lib/api'

export type ApiProfile = {
  id: number
  name: string
  email: string
  handle: string
  avatarUrl: string
  travelTagline: string
  bio: string
  homeCity: string
  visitedCities: string[]
  stats: {
    trips: number
    posts: number
    savedRoutes: number
  }
  favoriteRoutes: {
    id: string
    title: string
    cities: string[]
    durationDays: number
  }[]
  createdAt: string
}

export type ApiProfilePost = {
  id: string
  title: string
  city: string
  createdAt: string
}

export type ApiProfileFavoriteRoute = {
  id: string
  title: string
  cities: string[]
  durationDays: number
}

type ProfilePageResponse<T> = {
  page: number
  limit: number
  total: number
  items: T[]
}

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
