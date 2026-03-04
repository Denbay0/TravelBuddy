import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import CreateRouteCard, { type CreateRouteFormState } from '../features/routes/components/CreateRouteCard'
import FeaturedRoutesSection from '../features/routes/components/FeaturedRoutesSection'
import RouteFilters from '../features/routes/components/RouteFilters'
import RoutesHero from '../features/routes/components/RoutesHero'
import { type RouteSort } from '../features/routes/components/routeFiltersConfig'
import { isAuthError } from '../lib/authGuards'
import { routeService } from '../services/routeService'
import type { ApiRoute } from '../types/api'
import type { Route, RouteFilter } from '../types/travel'

const emptyForm: CreateRouteFormState = { title: '', duration: '', transport: 'Автомобиль', note: '' }

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

  const createRef = useRef<HTMLDivElement>(null)
  const popularRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    setSearch(params.get('q') || '')
    if (params.get('sort') === 'popular') {
      setSort('Популярные')
      setActiveFilter('Популярные')
    }
  }, [params])

  useEffect(() => {
    if (location.hash === '#create') createRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  const loadRoutes = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await routeService.list({ page, limit: 12, search, sort: sort === 'Популярные' ? 'popular' : 'new', savedOnly: activeFilter === 'Сохранённые' && Boolean(user) })
      setRoutes(response.items.map(mapApiRouteToRoute))
      setTotal(response.total)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить маршруты.')
    } finally {
      setIsLoading(false)
    }
  }, [activeFilter, page, search, sort, user])

  useEffect(() => { void loadRoutes() }, [loadRoutes])

  const handleFieldChange = (field: keyof CreateRouteFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateRoute = async ({ origin, destination, waypoints, preview }: Parameters<ComponentProps<typeof CreateRouteCard>['onSubmit']>[0]) => {
    if (!user) {
      setError('Нужно войти в аккаунт, чтобы сохранить маршрут.')
      navigate('/login')
      return
    }
    if (!origin || !destination || !preview || !form.title.trim() || !form.duration.trim()) {
      setError('Проверьте обязательные поля маршрута.')
      return
    }

    try {
      const created = await routeService.create({
        title: form.title,
        description: form.note,
        note: form.note,
        durationDays: Number(form.duration),
        transport: form.transport,
        originName: origin.label,
        originLat: origin.lat,
        originLon: origin.lon,
        destinationName: destination.label,
        destinationLat: destination.lat,
        destinationLon: destination.lon,
        waypoints: waypoints.map((point) => ({ name: point.label, lat: point.lat, lon: point.lon })),
        routeGeojson: preview.geojson ?? null,
        distanceKm: preview.distanceKm,
        routeType: preview.routeType,
      })
      setRoutes((prev) => [mapApiRouteToRoute(created), ...prev])
      setForm(emptyForm)
      setError('')
    } catch (createError) {
      setError(isAuthError(createError) ? 'Нужно войти в аккаунт, чтобы сохранить маршрут.' : createError instanceof Error ? createError.message : 'Не удалось создать маршрут.')
    }
  }

  const handleToggleSave = async (route: Route) => {
    if (!user) {
      setError('Сохранять маршруты можно после входа в аккаунт.')
      navigate('/login')
      return
    }
    setPendingRouteId(route.id)
    setError('')
    try {
      const response = route.isSaved ? await routeService.unsave(route.id) : await routeService.save(route.id)
      setRoutes((prev) => prev.map((item) => (item.id === route.id ? { ...item, isSaved: response.isSaved, saves: response.saves } : item)))
    } catch (saveError) {
      setError(isAuthError(saveError) ? 'Сохранять маршруты можно после входа в аккаунт.' : saveError instanceof Error ? saveError.message : 'Не удалось обновить сохранение.')
    } finally { setPendingRouteId(null) }
  }

  const filteredRoutes = useMemo(() => {
    const query = search.toLowerCase().trim()
    const base = routes.filter((route) => {
      const matchesSearch = !query || route.title.toLowerCase().includes(query) || route.country.toLowerCase().includes(query) || route.cities.some((city) => city.toLowerCase().includes(query))
      if (activeFilter === 'По транспорту') return matchesSearch && route.transport === form.transport
      if (activeFilter === 'По длительности') return matchesSearch && route.durationDays <= 7
      if (activeFilter === 'Популярные') return matchesSearch && route.saves >= 1
      if (activeFilter === 'Новые') return matchesSearch && Boolean(route.isNew)
      if (activeFilter === 'Сохранённые') return user ? matchesSearch && Boolean(route.isSaved) : matchesSearch
      return matchesSearch
    })

    return [...base].sort((a, b) => sort === 'Популярные' ? b.saves - a.saves : sort === 'Новые' ? b.id - a.id : sort === 'Короткие' ? a.durationDays - b.durationDays : b.durationDays - a.durationDays)
  }, [activeFilter, form.transport, routes, search, sort, user])

  return (
    <>
      <RoutesHero onCreateRoute={() => createRef.current?.scrollIntoView({ behavior: 'smooth' })} onShowPopular={() => { setSort('Популярные'); setActiveFilter('Популярные'); popularRef.current?.scrollIntoView({ behavior: 'smooth' }) }} />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10">
        {error ? <div className="rounded-2xl border border-amber/40 bg-amber/15 px-4 py-3 text-sm text-ink/90">{error}</div> : null}
        <div ref={createRef}>
          <CreateRouteCard form={form} onChange={handleFieldChange} onSubmit={handleCreateRoute} submitLabel={user ? 'Сохранить маршрут' : 'Войти, чтобы сохранить маршрут'} submitHint={!user ? 'Просмотр карты доступен без авторизации. Сохранение — после входа.' : undefined} />
        </div>
        <RouteFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} />
        {isLoading ? <p className="text-sm text-ink/65">Загрузка маршрутов...</p> : null}
        {!isLoading && filteredRoutes.length === 0 ? <div className="rounded-2xl border border-borderline/60 bg-surface px-4 py-4 text-sm text-ink/80">Ничего не найдено.</div> : null}
        <div ref={popularRef}><FeaturedRoutesSection routes={filteredRoutes} onToggleSave={handleToggleSave} pendingRouteId={pendingRouteId} /></div>
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="rounded-full border border-borderline/70 px-4 py-2 text-sm disabled:opacity-50">Назад</button>
          <span className="text-sm text-ink/70">Страница {page}</span>
          <button onClick={() => setPage((prev) => prev + 1)} disabled={routes.length === 0 || page * 12 >= total} className="rounded-full border border-borderline/70 px-4 py-2 text-sm disabled:opacity-50">Вперёд</button>
        </div>
      </main>
    </>
  )
}
