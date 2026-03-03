import { apiRequest } from '../lib/api'
import type {
  ApiMessageResponse,
  ApiPost,
  ApiPostComment,
  PostCommentsResponse,
  PostListResponse,
} from '../types/api'

export const postService = {
  async list(page = 1, limit = 10): Promise<PostListResponse> {
    return apiRequest<PostListResponse>(`/posts?page=${page}&limit=${limit}`)
  },

  async create(payload: { title: string; content: string; city: string }): Promise<ApiPost> {
    return apiRequest<ApiPost>('/posts', {
      method: 'POST',
      body: payload,
    })
  },

  async like(postId: number): Promise<ApiMessageResponse> {
    return apiRequest<ApiMessageResponse>(`/posts/${postId}/like`, { method: 'POST' })
  },

  async unlike(postId: number): Promise<ApiMessageResponse> {
    return apiRequest<ApiMessageResponse>(`/posts/${postId}/like`, { method: 'DELETE' })
  },

  async save(postId: number): Promise<ApiMessageResponse> {
    return apiRequest<ApiMessageResponse>(`/posts/${postId}/save`, { method: 'POST' })
  },

  async unsave(postId: number): Promise<ApiMessageResponse> {
    return apiRequest<ApiMessageResponse>(`/posts/${postId}/save`, { method: 'DELETE' })
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
}
