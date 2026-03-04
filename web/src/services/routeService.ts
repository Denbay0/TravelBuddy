import { apiRequest } from '../lib/api'
import type { ApiRoute, ApiRouteSaveResponse, RouteListResponse, RoutePoint, RoutePreviewResponse } from '../types/api'

export type RoutesQuery = {
  page?: number
  limit?: number
  sort?: 'new' | 'popular'
  search?: string
  savedOnly?: boolean
}

type RouteCreateRequest = {
  title: string
  description?: string
  startLocation: string
  endLocation: string
  stops: string[]
  durationDays: number
  transport: ApiRoute['transport']
  note?: string
  points: RoutePoint[]
}

type RouteUpdateRequest = Partial<RouteCreateRequest>

function buildRoutesQueryString(query: RoutesQuery): string {
  const params = new URLSearchParams()

  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.search?.trim()) params.set('q', query.search.trim())

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export const routeService = {
  async list(query: RoutesQuery = {}): Promise<RouteListResponse> {
    const endpoint = query.sort === 'popular' ? '/routes/trending' : '/routes'
    const result = await apiRequest<RouteListResponse>(`${endpoint}${buildRoutesQueryString(query)}`)

    let filteredItems = [...result.items]
    if (query.savedOnly) filteredItems = filteredItems.filter((route) => route.isSaved)

    return {
      ...result,
      total: query.savedOnly ? filteredItems.length : result.total,
      items: filteredItems,
    }
  },

  async preview(points: RoutePoint[]): Promise<RoutePreviewResponse> {
    return apiRequest<RoutePreviewResponse>('/routes/preview', {
      method: 'POST',
      body: { points },
    })
  },

  async create(payload: RouteCreateRequest): Promise<ApiRoute> {
    return apiRequest<ApiRoute>('/routes', {
      method: 'POST',
      body: payload,
    })
  },

  async getById(routeId: number): Promise<ApiRoute> {
    return apiRequest<ApiRoute>(`/routes/${routeId}`)
  },

  async update(routeId: number, payload: RouteUpdateRequest): Promise<ApiRoute> {
    return apiRequest<ApiRoute>(`/routes/${routeId}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  async remove(routeId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/routes/${routeId}`, { method: 'DELETE' })
  },

  async save(routeId: number): Promise<ApiRouteSaveResponse> {
    return apiRequest<ApiRouteSaveResponse>(`/routes/${routeId}/save`, { method: 'POST' })
  },

  async unsave(routeId: number): Promise<ApiRouteSaveResponse> {
    return apiRequest<ApiRouteSaveResponse>(`/routes/${routeId}/save`, { method: 'DELETE' })
  },
}
