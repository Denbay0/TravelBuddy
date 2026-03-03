import type { ApiPost, ApiPostComment } from '../types/api'
import { postService } from './postService'

type FeedQuery = {
  page?: number
  limit?: number
}

export const communityService = {
  async getFeed(query: FeedQuery = {}): Promise<{ items: ApiPost[]; total: number; page: number; limit: number }> {
    return postService.list(query.page ?? 1, query.limit ?? 10)
  },

  async createPost(payload: { title: string; content: string; city: string }): Promise<ApiPost> {
    return postService.create(payload)
  },

  async toggleLike(postId: number, liked: boolean) {
    if (liked) {
      return postService.unlike(postId)
    }
    return postService.like(postId)
  },

  async toggleSave(postId: number, saved: boolean) {
    if (saved) {
      return postService.unsave(postId)
    }
    return postService.save(postId)
  },

  async addComment(postId: number, content: string): Promise<ApiPostComment> {
    return postService.createComment(postId, content)
  },
}
