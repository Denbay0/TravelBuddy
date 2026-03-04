import { apiRequest } from '../lib/api'
import type { SearchResponse } from '../types/api'

export const searchService = {
  async search(q: string): Promise<SearchResponse> {
    return apiRequest<SearchResponse>(`/search?q=${encodeURIComponent(q)}&limit=5`)
  },
}
