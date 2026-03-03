import type { RouteFilter } from '../../../types/travel'

export const routeFilterChips: RouteFilter[] = [
  'По городам',
  'По странам',
  'По транспорту',
  'По длительности',
  'Популярные',
  'Новые',
  'Сохранённые',
]

export const routeSortOptions = ['Популярные', 'Новые', 'Короткие', 'Длинные'] as const

export type RouteSort = (typeof routeSortOptions)[number]
