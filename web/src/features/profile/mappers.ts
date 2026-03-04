import { env } from '../../config/env'
import type { ApiProfile } from '../../types/api'
import type { UserProfile } from './types'

const DEFAULT_BIO = 'Расскажите о себе и ваших любимых направлениях в следующих релизах TravelBuddy.'
const DEFAULT_TAGLINE = 'Путешествие начинается здесь.'
const DEFAULT_HOME_CITY = 'Не указан'

function joinMediaUrl(base: string, path: string): string {
  if (!base || base === '/') {
    return path
  }

  return `${base.replace(/\/$/, '')}${path}`
}

export function mapApiUserToProfile(user: ApiProfile): UserProfile {
  const absoluteAvatarUrl = user.avatarUrl.startsWith('http')
    ? user.avatarUrl
    : joinMediaUrl(env.mediaBaseUrl, user.avatarUrl)

  return {
    id: String(user.id),
    name: user.name,
    avatarUrl: absoluteAvatarUrl,
    travelTagline: user.travelTagline || DEFAULT_TAGLINE,
    bio: user.bio || DEFAULT_BIO,
    homeCity: user.homeCity || DEFAULT_HOME_CITY,
    visitedCities: user.visitedCities ?? [],
    travelTags: user.travelTags ?? user.visitedCities ?? [],
    favoriteRoutes: user.favoriteRoutes ?? [],
    stats: {
      trips: user.stats?.trips ?? 0,
      posts: user.stats?.posts ?? 0,
      savedRoutes: user.stats?.savedRoutes ?? 0,
      favoriteTransport: user.stats?.favoriteTransport ?? 'Пешком',
    },
  }
}
