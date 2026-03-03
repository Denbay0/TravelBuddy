import { env } from '../../config/env'
import type { ApiProfile } from '../../services/profileService'
import type { UserProfile } from './types'

const DEFAULT_BIO = 'Расскажите о себе и ваших любимых направлениях в следующих релизах TravelBuddy.'
const DEFAULT_TAGLINE = 'Путешествие начинается здесь.'
const DEFAULT_HOME_CITY = 'Не указан'

export function mapApiUserToProfile(user: ApiProfile): UserProfile {
  const absoluteAvatarUrl = user.avatarUrl.startsWith('http')
    ? user.avatarUrl
    : `${env.mediaBaseUrl}${user.avatarUrl}`

  return {
    id: String(user.id),
    name: user.name,
    avatarUrl: absoluteAvatarUrl,
    travelTagline: user.travelTagline || DEFAULT_TAGLINE,
    bio: user.bio || DEFAULT_BIO,
    homeCity: user.homeCity || DEFAULT_HOME_CITY,
    visitedCities: user.visitedCities,
    favoriteRoutes: user.favoriteRoutes,
    stats: {
      trips: user.stats.trips,
      posts: user.stats.posts,
      savedRoutes: user.stats.savedRoutes,
      favoriteTransport: 'Поезд',
    },
  }
}
