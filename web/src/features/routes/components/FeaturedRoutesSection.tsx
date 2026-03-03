import type { Route } from '../../../types/travel'
import RouteCard from './RouteCard'

type FeaturedRoutesSectionProps = {
  routes: Route[]
}

export default function FeaturedRoutesSection({ routes }: FeaturedRoutesSectionProps) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Популярные маршруты</h2>
        <p className="text-sm text-ink/60">Подборка лучших идей сообщества</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </section>
  )
}
