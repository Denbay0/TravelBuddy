import type { TransportCategory, User } from '../../types/travel'

export type CommunityPost = {
  id: number
  author: User
  route: string
  date: string
  imageUrl: string
  caption: string
  transport: TransportCategory
  likes: number
  comments: number
  saved?: boolean
  liked?: boolean
}

export type TrendingRoute = {
  id: number
  name: string
  meta: string
}
