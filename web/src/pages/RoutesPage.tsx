import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import CreateRouteCard, { type CreateRouteFormState } from '../features/routes/components/CreateRouteCard'
import FeaturedRoutesSection from '../features/routes/components/FeaturedRoutesSection'
import RouteFilters from '../features/routes/components/RouteFilters'
import RoutesHero from '../features/routes/components/RoutesHero'
import { type RouteSort } from '../features/routes/components/routeFiltersConfig'
import { routeService } from '../services/routeService'
import type { ApiRoute, RoutePoint } from '../types/api'
import type { Route, RouteFilter, TransportCategory } from '../types/travel'

const emptyForm: CreateRouteFormState = { title: '', stops: '', duration: '', transport: 'Автомобиль', note: '' }

function mapApiRouteToRoute(route: ApiRoute): Route {
  return {
    id: route.id,
    title: route.title,
    cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
    cities: route.cities ?? [],
    durationDays: route.durationDays,
    transport: route.transport,
    saves: route.savesCount ?? 0,
    author: route.owner.name,
    country: (route.cities ?? []).join(', '),
    isNew: Date.now() - Date.parse(route.createdAt) < 1000 * 60 * 60 * 24 * 7,
    isSaved: route.isSaved,
    distanceKm: route.distanceKm,
  }
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [form, setForm] = useState<CreateRouteFormState>(emptyForm)
  const [activeFilter, setActiveFilter] = useState<RouteFilter>('Популярные')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<RouteSort>('Популярные')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pendingRouteId, setPendingRouteId] = useState<number | null>(null)
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([])
  const [distanceKm, setDistanceKm] = useState(0)

  const createRef = useRef<HTMLDivElement>(null)
  const popularRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const [params] = useSearchParams()

  useEffect(() => {
    setSearch(params.get('q') || '')
    if (params.get('sort') === 'popular') {
      setSort('Популярные')
      setActiveFilter('Популярные')
    }
  }, [params])

  useEffect(() => {
    if (location.hash === '#create') {
      createRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  const loadRoutes = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await routeService.list({
        page,
        limit: 12,
        search,
        sort: sort === 'Популярные' ? 'popular' : 'new',
        savedOnly: activeFilter === 'Сохранённые',
      })
      setRoutes(response.items.map(mapApiRouteToRoute))
      setTotal(response.total)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить маршруты.')
    } finally {
      setIsLoading(false)
    }
  }, [activeFilter, page, search, sort])

  useEffect(() => {
    void loadRoutes()
  }, [loadRoutes])

  useEffect(() => {
    async function refreshPreview() {
      if (routePoints.length < 2) {
        setDistanceKm(0)
        return
      }
      try {
        const preview = await routeService.preview(routePoints)
        setDistanceKm(preview.distanceKm)
      } catch {
        setDistanceKm(0)
      }
    }
    void refreshPreview()
  }, [routePoints])

  const handleFieldChange = (field: keyof CreateRouteFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: field === 'transport' ? (value as TransportCategory) : value }))
  }

  const handleCreateRoute = async () => {
    if (!form.title.trim() || !form.stops.trim() || !form.duration.trim()) return
    const cities = form.stops.split(',').map((city) => city.trim()).filter(Boolean)
    try {
      const created = await routeService.create({
        title: form.title,
        description: form.note,
        note: form.note,
        cities,
        points: routePoints,
        durationDays: Number(form.duration),
        transport: form.transport,
      })
      setRoutes((prev) => [mapApiRouteToRoute(created), ...prev])
      setForm(emptyForm)
      setRoutePoints([])
      setDistanceKm(0)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Не удалось создать маршрут.')
    }
  }

  const handleToggleSave = async (route: Route) => {
    setPendingRouteId(route.id)
    setError('')
    try {
      const response = route.isSaved ? await routeService.unsave(route.id) : await routeService.save(route.id)
      setRoutes((prev) =>
        prev.map((item) => (item.id === route.id ? { ...item, isSaved: response.isSaved, saves: response.saves } : item)),
      )
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось обновить сохранение.')
    } finally {
      setPendingRouteId(null)
    }
  }

  const filteredRoutes = useMemo(() => {
    const query = search.toLowerCase().trim()
    const base = routes.filter((route) => {
      const matchesSearch =
        !query ||
        route.title.toLowerCase().includes(query) ||
        route.country.toLowerCase().includes(query) ||
        route.cities.some((city) => city.toLowerCase().includes(query))
      if (activeFilter === 'По транспорту') return matchesSearch && route.transport === form.transport
      if (activeFilter === 'По длительности') return matchesSearch && route.durationDays <= 7
      if (activeFilter === 'Популярные') return matchesSearch && route.saves >= 1
      if (activeFilter === 'Новые') return matchesSearch && Boolean(route.isNew)
      if (activeFilter === 'Сохранённые') return matchesSearch && Boolean(route.isSaved)
      return matchesSearch
    })

    return [...base].sort((a, b) =>
      sort === 'Популярные'
        ? b.saves - a.saves
        : sort === 'Новые'
          ? b.id - a.id
          : sort === 'Короткие'
            ? a.durationDays - b.durationDays
            : b.durationDays - a.durationDays,
    )
  }, [activeFilter, form.transport, routes, search, sort])

  return (
    <>
      <RoutesHero
        onCreateRoute={() => createRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onShowPopular={() => {
          setSort('Популярные')
          setActiveFilter('Популярные')
          popularRef.current?.scrollIntoView({ behavior: 'smooth' })
        }}
      />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-10">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <div ref={createRef}>
          <CreateRouteCard
            form={form}
            onChange={handleFieldChange}
            onSubmit={handleCreateRoute}
            onPointsResolved={setRoutePoints}
            distanceKm={distanceKm}
          />
        </div>
        <RouteFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />
        {isLoading ? <p className="text-sm text-ink/65">Загрузка маршрутов...</p> : null}
        <div ref={popularRef}>
          <FeaturedRoutesSection routes={filteredRoutes} onToggleSave={handleToggleSave} pendingRouteId={pendingRouteId} />
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm disabled:opacity-50"
          >
            Назад
          </button>
          <span className="text-sm text-ink/70">Страница {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={routes.length === 0 || page * 12 >= total}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm disabled:opacity-50"
          >
            Вперёд
          </button>
        </div>
      </main>
    </>
  )
}
