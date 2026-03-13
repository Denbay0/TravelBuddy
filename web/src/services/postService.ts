import { apiRequest } from '../lib/api'
import type {
  ApiPost,
  ApiPostComment,
  ApiPostReactionResponse,
  PostCommentsResponse,
  PostListResponse,
} from '../types/api'

export const postService = {
  async list(page = 1, limit = 10): Promise<PostListResponse> {
    return apiRequest<PostListResponse>(`/posts?page=${page}&limit=${limit}`)
  },

  async create(payload: {
    title: string
    content: string
    city: string
    transport: string
    tripDate?: string
  }): Promise<ApiPost> {
    return apiRequest<ApiPost>('/posts', {
      method: 'POST',
      body: payload,
    })
  },

  async getById(postId: number): Promise<ApiPost> {
    return apiRequest<ApiPost>(`/posts/${postId}`)
  },

  async update(
    postId: number,
    payload: Partial<{
      title: string
      content: string
      city: string
      transport: string
      tripDate: string
    }>,
  ): Promise<ApiPost> {
    return apiRequest<ApiPost>(`/posts/${postId}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  async remove(postId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/posts/${postId}`, {
      method: 'DELETE',
    })
  },

  async like(postId: number): Promise<ApiPostReactionResponse> {
    return apiRequest<ApiPostReactionResponse>(`/posts/${postId}/like`, { method: 'POST' })
  },

  async unlike(postId: number): Promise<ApiPostReactionResponse> {
    return apiRequest<ApiPostReactionResponse>(`/posts/${postId}/like`, { method: 'DELETE' })
  },

  async save(postId: number): Promise<ApiPostReactionResponse> {
    return apiRequest<ApiPostReactionResponse>(`/posts/${postId}/save`, { method: 'POST' })
  },

  async unsave(postId: number): Promise<ApiPostReactionResponse> {
    return apiRequest<ApiPostReactionResponse>(`/posts/${postId}/save`, { method: 'DELETE' })
  },

  async comments(postId: number, page = 1, limit = 10): Promise<PostCommentsResponse> {
    return apiRequest<PostCommentsResponse>(`/posts/${postId}/comments?page=${page}&limit=${limit}`)
  },

  async createComment(postId: number, content: string): Promise<ApiPostComment> {
    return apiRequest<ApiPostComment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: { content },
    })
  },

  async deleteComment(postId: number, commentId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    })
  },
}
