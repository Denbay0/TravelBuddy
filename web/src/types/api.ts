export type ApiErrorPayload = {
  detail?: string | { msg?: string }[]
}

export type ApiUser = {
  id: number
  name: string
  email: string
  handle: string
  avatarUrl: string
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
  stats: {
    trips: number
    posts: number
    savedRoutes: number
  }
  favoriteRoutes: {
    id: string
    title: string
    cities: string[]
    durationDays: number
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

export type ApiRoute = {
  id: number
  title: string
  description: string
  cities: string[]
  durationDays: number
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
export type ApiMessageResponse = { message: string }
