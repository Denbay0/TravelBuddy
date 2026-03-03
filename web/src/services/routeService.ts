import { apiRequest } from '../lib/api'
import type { ApiRoute, ApiRouteSaveResponse, RouteListResponse } from '../types/api'

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
  cities: string[]
  durationDays: number
  transport: ApiRoute['transport']
}

type RouteUpdateRequest = Partial<RouteCreateRequest>

function buildRoutesQueryString(query: RoutesQuery): string {
  const params = new URLSearchParams()

  if (query.page) {
    params.set('page', String(query.page))
  }
  if (query.limit) {
    params.set('limit', String(query.limit))
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export const routeService = {
  async list(query: RoutesQuery = {}): Promise<RouteListResponse> {
    const endpoint = query.sort === 'popular' ? '/routes/trending' : '/routes'
    const result = await apiRequest<RouteListResponse>(`${endpoint}${buildRoutesQueryString(query)}`)

    let filteredItems = [...result.items]

    if (query.search?.trim()) {
      const normalizedQuery = query.search.trim().toLowerCase()
      filteredItems = filteredItems.filter((route) => {
        const cityMatch = route.cities.some((city) => city.toLowerCase().includes(normalizedQuery))
        return (
          route.title.toLowerCase().includes(normalizedQuery) ||
          route.description.toLowerCase().includes(normalizedQuery) ||
          cityMatch ||
          route.owner.name.toLowerCase().includes(normalizedQuery)
        )
      })
    }

    if (query.savedOnly) {
      filteredItems = filteredItems.filter((route) => route.isSaved)
    }

    if (query.sort === 'new') {
      filteredItems.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    }

    return {
      ...result,
      total: query.search || query.savedOnly ? filteredItems.length : result.total,
      items: filteredItems,
    }
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
    return apiRequest<{ message: string }>(`/routes/${routeId}`, {
      method: 'DELETE',
    })
  },

  async save(routeId: number): Promise<ApiRouteSaveResponse> {
    return apiRequest<ApiRouteSaveResponse>(`/routes/${routeId}/save`, {
      method: 'POST',
    })
  },

  async unsave(routeId: number): Promise<ApiRouteSaveResponse> {
    return apiRequest<ApiRouteSaveResponse>(`/routes/${routeId}/save`, {
      method: 'DELETE',
    })
  },
}
