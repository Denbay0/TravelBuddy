import type { CommunityPost, TrendingRoute } from './types'
import type { User } from '../../types/travel'

export const initialPosts: CommunityPost[] = [
  {
    id: 1,
    author: {
      id: 11,
      name: 'Ирина Смирнова',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
    route: 'Лиссабон — Синтра',
    date: '12 марта 2026',
    imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=80',
    caption:
      'Утренний поезд до Синтры оказался идеальным: меньше людей, мягкий свет и много времени на спокойную прогулку по дворцам.',
    transport: 'Поезд',
    likes: 142,
    comments: 18,
    saved: true,
  },
  {
    id: 2,
    author: {
      id: 12,
      name: 'Максим Орлов',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    route: 'Тбилиси — Казбеги',
    date: '5 марта 2026',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
    caption:
      'Дорога заняла около трёх часов на автомобиле, но каждая остановка у обзорных точек стоила времени. Сохраняйте координаты заранее.',
    transport: 'Автомобиль',
    likes: 198,
    comments: 26,
  },
]

export const popularAuthors: User[] = [
  {
    id: 1,
    name: 'Анна Ковалёва',
    focus: 'Европейские city-break маршруты',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Роман Жуков',
    focus: 'Поездки на поезде и пешком',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 3,
    name: 'Ольга Веденеева',
    focus: 'Короткие маршруты у моря',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
]

export const trendingRoutes: TrendingRoute[] = [
  { id: 1, name: 'Стамбул за 3 дня', meta: 'Пешком · 1,8k сохранений' },
  { id: 2, name: 'Берлин и Потсдам', meta: 'Поезд · 1,2k сохранений' },
  { id: 3, name: 'Амальфитанское побережье', meta: 'Автомобиль · 2,4k сохранений' },
]
