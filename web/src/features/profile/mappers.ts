import { env } from '../../config/env'
import type { ApiUser } from '../../types/api'
import type { UserProfile } from './types'

const DEFAULT_BIO = 'Расскажите о себе и ваших любимых направлениях в следующих релизах TravelBuddy.'
const DEFAULT_TAGLINE = 'Путешествие начинается здесь.'
const DEFAULT_HOME_CITY = 'Не указан'

export function mapApiUserToProfile(user: ApiUser): UserProfile {
  const absoluteAvatarUrl = user.avatar_url.startsWith('http')
    ? user.avatar_url
    : `${env.mediaBaseUrl}${user.avatar_url}`

  return {
    id: String(user.id),
    name: user.username,
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
      favoriteTransport: '—',
    },
  }
}
