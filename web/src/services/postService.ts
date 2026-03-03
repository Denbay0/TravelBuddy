import { apiRequest } from '../lib/api'

export type ApiPost = {
  id: number
  title: string
  content: string
  city: string
  owner: {
    id: number
    name: string
    handle: string
  }
  likesCount: number
  commentsCount: number
  savesCount: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
  updatedAt: string
}

export type ApiPostComment = {
  id: number
  content: string
  owner: {
    id: number
    name: string
    handle: string
  }
  createdAt: string
  updatedAt: string
}

type MessageResponse = {
  message: string
}

type PostListResponse = {
  page: number
  limit: number
  total: number
  items: ApiPost[]
}

type PostCommentsResponse = {
  page: number
  limit: number
  total: number
  items: ApiPostComment[]
}

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

  async like(postId: number): Promise<MessageResponse> {
    return apiRequest<MessageResponse>(`/posts/${postId}/like`, { method: 'POST' })
  },

  async unlike(postId: number): Promise<MessageResponse> {
    return apiRequest<MessageResponse>(`/posts/${postId}/like`, { method: 'DELETE' })
  },

  async save(postId: number): Promise<MessageResponse> {
    return apiRequest<MessageResponse>(`/posts/${postId}/save`, { method: 'POST' })
  },

  async unsave(postId: number): Promise<MessageResponse> {
    return apiRequest<MessageResponse>(`/posts/${postId}/save`, { method: 'DELETE' })
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
