import type { TransportCategory } from './travel'

export type ApiErrorPayload = {
  detail?: string | { msg?: string }[]
}

export type ApiUser = {
  id: number
  name: string
  email: string
  handle: string
  avatarUrl: string
  isAdmin: boolean
  createdAt: string
}

export type LoginRequest = {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginResponse = {
  message: string
  user: ApiUser
  csrfToken: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type RegisterResponse = {
  message: string
  user: ApiUser
  csrfToken: string
}

export type LogoutResponse = {
  message: string
}

export type CsrfResponse = {
  csrfToken: string
}

export type ApiProfile = {
  id: number
  name: string
  email: string
  handle: string
  avatarUrl: string
  travelTagline: string
  bio: string
  homeCity: string
  visitedCities: string[]
  travelTags: string[]
  stats: {
    trips: number
    posts: number
    savedRoutes: number
    favoriteTransport: TransportCategory
  }
  favoriteRoutes: {
    id: string
    title: string
    cities: string[]
    durationDays: number
    transport: TransportCategory
  }[]
  createdAt: string
}

export type ApiProfilePost = {
  id: string
  title: string
  city: string
  createdAt: string
}

export type ApiProfileFavoriteRoute = {
  id: string
  title: string
  cities: string[]
  durationDays: number
  transport: TransportCategory
}

export type ProfilePageResponse<T> = {
  page: number
  limit: number
  total: number
  items: T[]
}

export type ApiPost = {
  id: number
  title: string
  content: string
  city: string
  transport: TransportCategory
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

export type RoutePoint = {
  name: string
  lat: number
  lon: number
}

export type ApiSearchUser = {
  id: number
  name: string
  handle: string
  avatarUrl: string
}

export type ApiRoute = {
  startLocation: string
  endLocation: string
  stops: string[]
  id: number
  title: string
  description: string
  cities: string[]
  durationDays: number
  transport: TransportCategory
  note: string
  points: RoutePoint[]
  distanceKm: number
  savesCount: number
  owner: {
    id: number
    name: string
    handle: string
  }
  isSaved: boolean
  createdAt: string
  updatedAt: string
}

export type PostListResponse = ProfilePageResponse<ApiPost>
export type PostCommentsResponse = ProfilePageResponse<ApiPostComment>
export type RouteListResponse = ProfilePageResponse<ApiRoute>

export type ApiPostReactionResponse = {
  message: string
  liked: boolean
  saved: boolean
  isSaved: boolean
  likes: number
  saves: number
}

export type ApiRouteSaveResponse = {
  message: string
  saved: boolean
  isSaved: boolean
  saves: number
}

export type RoutePreviewResponse = {
  distanceKm: number
}

export type SearchResponse = {
  query: string
  routes: ApiRoute[]
  posts: ApiPost[]
  users: ApiSearchUser[]
}
