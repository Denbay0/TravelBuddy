import type { TrendingRoute } from '../features/community/types'
import { apiRequest } from '../lib/api'
import type { User } from '../types/travel'
import type { ApiPost, ApiPostComment, ApiPostReactionResponse, RouteListResponse } from '../types/api'
import { postService } from './postService'

type FeedQuery = {
  page?: number
  limit?: number
}

type PopularUsersResponse = {
  items: Array<{
    id: number
    name: string
    handle: string
    postsCount: number
    followersCount: number
  }>
  page: number
  limit: number
  total: number
}

export const communityService = {
  async getFeed(query: FeedQuery = {}): Promise<{ items: ApiPost[]; total: number; page: number; limit: number }> {
    return postService.list(query.page ?? 1, query.limit ?? 10)
  },

  async getPopularUsers(page = 1, limit = 5): Promise<User[]> {
    const response = await apiRequest<PopularUsersResponse>(`/users/popular?page=${page}&limit=${limit}`)
    return response.items.map((user) => ({
      id: user.id,
      name: user.name,
      avatarUrl: `https://i.pravatar.cc/160?u=${user.id}`,
      focus: `${user.postsCount} публикаций`,
    }))
  },

  async getTrendingRoutes(page = 1, limit = 5): Promise<TrendingRoute[]> {
    const response = await apiRequest<RouteListResponse>(`/routes/trending?page=${page}&limit=${limit}`)
    return response.items.map((route) => ({
      id: route.id,
      name: route.title,
      meta: `${route.transport} · ${route.savesCount} сохранений`,
    }))
  },

  async createPost(payload: {
    title: string
    content: string
    city: string
    transport: string
    tripDate?: string
  }): Promise<ApiPost> {
    return postService.create(payload)
  },

  async toggleLike(postId: number, liked: boolean): Promise<ApiPostReactionResponse> {
    if (liked) {
      return postService.unlike(postId)
    }
    return postService.like(postId)
  },

  async toggleSave(postId: number, saved: boolean): Promise<ApiPostReactionResponse> {
    if (saved) {
      return postService.unsave(postId)
    }
    return postService.save(postId)
  },

  async addComment(postId: number, content: string): Promise<ApiPostComment> {
    return postService.createComment(postId, content)
  },
}
