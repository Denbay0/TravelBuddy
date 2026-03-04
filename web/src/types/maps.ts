import type { TransportCategory } from './travel'

export type MapLocation = {
  label: string
  lat: number
  lon: number
  country?: string | null
  city?: string | null
  raw?: Record<string, unknown> | null
}

export type RoutePreviewRequest = {
  transport: TransportCategory
  origin: { name: string; lat: number; lon: number }
  destination: { name: string; lat: number; lon: number }
  waypoints: { name: string; lat: number; lon: number }[]
}

export type RoutePreviewResponse = {
  mode: TransportCategory
  routeType: 'real' | 'schematic'
  distanceKm: number
  durationMinutes?: number | null
  bounds: [[number, number], [number, number]]
  points: { name: string; lat: number; lon: number }[]
  geojson?: GeoJSON.Feature | null
  warnings: string[]
}
