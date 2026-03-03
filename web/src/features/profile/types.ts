import type { TransportCategory } from '../../types/travel'

export type ProfileStats = {
  trips: number
  posts: number
  savedRoutes: number
  favoriteTransport: TransportCategory
}

export type TravelRoute = {
  id: string
  title: string
  cities: string[]
  durationDays: number
}

export type UserProfile = {
  id: string
  name: string
  avatarUrl: string
  travelTagline: string
  bio: string
  homeCity: string
  visitedCities: string[]
  favoriteRoutes: TravelRoute[]
  stats: ProfileStats
}
