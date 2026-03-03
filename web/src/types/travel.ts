export type TransportCategory = 'Автомобиль' | 'Самолёт' | 'Поезд' | 'Пешком'

export const transportCategories: TransportCategory[] = ['Автомобиль', 'Самолёт', 'Поезд', 'Пешком']

export type Route = {
  id: number
  title: string
  cover: string
  cities: string[]
  durationDays: number
  transport: TransportCategory
  saves: number
  author: string
  country: string
  isNew?: boolean
  isSaved?: boolean
}

export type RouteFilter =
  | 'По городам'
  | 'По странам'
  | 'По транспорту'
  | 'По длительности'
  | 'Популярные'
  | 'Новые'
  | 'Сохранённые'

export type TravelPost = {
  id: string
  imageUrl: string
  title: string
  caption: string
  date: string
  likes: number
  comments: number
  routeLabel: string
  transportCategory: TransportCategory
  location: string
}

export type User = {
  id: number
  name: string
  avatarUrl: string
  focus?: string
}
