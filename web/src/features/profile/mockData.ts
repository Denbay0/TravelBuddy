import type { UserProfile } from './types'

export const mockUserProfile: UserProfile = {
  id: 'traveler-109',
  name: 'Мария Воронцова',
  avatarUrl:
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
  travelTagline: 'Ищу уютные города, длинные маршруты и лучшие завтраки в пути.',
  bio: 'За последние 3 года собрала 27 маршрутов по России и Европе. Люблю комбинировать поезд и пешие прогулки, чтобы чувствовать ритм города.',
  homeCity: 'Санкт-Петербург',
  visitedCities: ['Таллин', 'Рига', 'Вильнюс', 'Казань', 'Калининград', 'Екатеринбург', 'Минск'],
  favoriteRoutes: [
    {
      id: 'route-baltic-loop',
      title: 'Балтийское кольцо на поезде',
      cities: ['Санкт-Петербург', 'Таллин', 'Рига', 'Вильнюс'],
      durationDays: 9,
    },
    {
      id: 'route-volga-weekend',
      title: 'Волжские выходные',
      cities: ['Казань', 'Самара', 'Нижний Новгород'],
      durationDays: 6,
    },
    {
      id: 'route-ural-citybreak',
      title: 'Уральский city-break',
      cities: ['Екатеринбург', 'Пермь'],
      durationDays: 4,
    },
  ],
  stats: {
    trips: 18,
    posts: 46,
    savedRoutes: 32,
    favoriteTransport: 'Поезд',
  },
}
