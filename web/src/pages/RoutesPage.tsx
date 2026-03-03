import { useMemo, useState } from 'react'
import CreateRouteCard, { type CreateRouteFormState } from '../features/routes/components/CreateRouteCard'
import FeaturedRoutesSection from '../features/routes/components/FeaturedRoutesSection'
import RouteFilters from '../features/routes/components/RouteFilters'
import RoutesHero from '../features/routes/components/RoutesHero'
import { initialRoutes } from '../features/routes/mockData'
import { type RouteSort } from '../features/routes/components/routeFiltersConfig'
import type { Route, RouteFilter, TransportCategory } from '../types/travel'

const emptyForm: CreateRouteFormState = {
  title: '',
  stops: '',
  duration: '',
  transport: 'Автомобиль',
  note: '',
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes)
  const [form, setForm] = useState<CreateRouteFormState>(emptyForm)
  const [activeFilter, setActiveFilter] = useState<RouteFilter>('Популярные')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<RouteSort>('Популярные')

  const handleFieldChange = (field: keyof CreateRouteFormState, value: string) => {
    if (field === 'transport') {
      setForm((prev) => ({ ...prev, [field]: value as TransportCategory }))
      return
    }

    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateRoute = () => {
    if (!form.title.trim() || !form.stops.trim() || !form.duration.trim()) {
      return
    }

    const cities = form.stops
      .split(',')
      .map((city) => city.trim())
      .filter(Boolean)

    const newRoute: Route = {
      id: Date.now(),
      title: form.title,
      cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
      cities,
      durationDays: Number(form.duration),
      transport: form.transport,
      saves: 0,
      author: 'Вы',
      country: 'Пользовательский маршрут',
      isNew: true,
    }

    setRoutes((prev) => [newRoute, ...prev])
    setForm(emptyForm)
  }

  const filteredRoutes = useMemo(() => {
    const base = routes.filter((route) => {
      const query = search.toLowerCase().trim()
      const matchesSearch =
        !query ||
        route.title.toLowerCase().includes(query) ||
        route.country.toLowerCase().includes(query) ||
        route.cities.some((city) => city.toLowerCase().includes(query))

      let matchesFilter = true
      if (activeFilter === 'По транспорту') {
        matchesFilter = route.transport === form.transport
      }
      if (activeFilter === 'По длительности') {
        matchesFilter = route.durationDays <= 7
      }
      if (activeFilter === 'Популярные') {
        matchesFilter = route.saves >= 250
      }
      if (activeFilter === 'Новые') {
        matchesFilter = Boolean(route.isNew)
      }
      if (activeFilter === 'Сохранённые') {
        matchesFilter = Boolean(route.isSaved)
      }

      return matchesSearch && matchesFilter
    })

    return [...base].sort((a, b) => {
      if (sort === 'Популярные') return b.saves - a.saves
      if (sort === 'Новые') return b.id - a.id
      if (sort === 'Короткие') return a.durationDays - b.durationDays
      return b.durationDays - a.durationDays
    })
  }, [activeFilter, form.transport, routes, search, sort])

  return (
    <>
      <RoutesHero />
      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
        <CreateRouteCard form={form} onChange={handleFieldChange} onSubmit={handleCreateRoute} />
        <RouteFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />
        <FeaturedRoutesSection routes={filteredRoutes} />
      </main>
    </>
  )
}
