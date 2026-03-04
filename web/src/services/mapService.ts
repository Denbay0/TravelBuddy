import { apiRequest } from '../lib/api'
import type { MapLocation, RoutePreviewRequest, RoutePreviewResponse } from '../types/maps'

export const mapService = {
  async suggest(q: string): Promise<MapLocation[]> {
    if (!q.trim()) return []
    const response = await apiRequest<{ items: MapLocation[] }>(`/maps/geocode/suggest?q=${encodeURIComponent(q.trim())}`)
    return response.items ?? []
  },

  async previewRoute(payload: RoutePreviewRequest): Promise<RoutePreviewResponse> {
    return apiRequest<RoutePreviewResponse>('/maps/route-preview', {
      method: 'POST',
      body: payload,
      skipCsrf: true,
    })
  },
}
