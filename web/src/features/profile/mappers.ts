import { env } from '../../config/env'
import type { ApiUser } from '../../types/api'
import type { UserProfile } from './types'

const DEFAULT_BIO = 'Расскажите о себе и ваших любимых направлениях в следующих релизах TravelBuddy.'
const DEFAULT_TAGLINE = 'Путешествие начинается здесь.'
const DEFAULT_HOME_CITY = 'Не указан'

export function mapApiUserToProfile(user: ApiUser): UserProfile {
  const absoluteAvatarUrl = user.avatarUrl.startsWith('http')
    ? user.avatarUrl
    : `${env.mediaBaseUrl}${user.avatarUrl}`

  return {
    id: String(user.id),
    name: user.name,
    avatarUrl: absoluteAvatarUrl,
    travelTagline: DEFAULT_TAGLINE,
    bio: DEFAULT_BIO,
    homeCity: DEFAULT_HOME_CITY,
    visitedCities: [],
    favoriteRoutes: [],
    stats: {
      trips: 0,
      posts: 0,
      savedRoutes: 0,
      favoriteTransport: 'Поезд',
    },
  }
}
