import { useState } from 'react'
import type { Route } from '../../../types/travel'
import RouteCard from './RouteCard'

type FeaturedRoutesSectionProps = {
  routes: Route[]
  onToggleSave?: (route: Route) => void
  pendingRouteId?: number | null
}

export default function FeaturedRoutesSection({ routes, onToggleSave, pendingRouteId }: FeaturedRoutesSectionProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Подборка маршрутов</h2>
      {routes.length === 0 ? <p className="rounded-2xl border border-dashed border-ink/20 p-4 text-sm text-ink/60">Маршруты пока не найдены.</p> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            onOpen={setSelectedRoute}
            onToggleSave={onToggleSave}
            isPending={pendingRouteId === route.id}
          />
        ))}
      </div>
      {selectedRoute ? (
        <div className="fixed inset-0 z-[70] bg-ink/40 p-4" onClick={() => setSelectedRoute(null)}>
          <div onClick={(event) => event.stopPropagation()} className="mx-auto mt-14 max-w-xl rounded-3xl bg-white p-6">
            <h3 className="text-xl font-semibold">{selectedRoute.title}</h3>
            <p className="mt-2 text-sm text-ink/70">{selectedRoute.cities.join(' → ')}</p>
            <p className="mt-3 text-sm text-ink/70">{selectedRoute.transport} · {selectedRoute.durationDays} дней</p>
            <p className="mt-2 text-sm text-ink/70">Дистанция: ~{Math.round(selectedRoute.distanceKm ?? 0)} км</p>
            <button onClick={() => setSelectedRoute(null)} className="mt-5 rounded-full border border-ink/20 px-4 py-2 text-sm">Закрыть</button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
