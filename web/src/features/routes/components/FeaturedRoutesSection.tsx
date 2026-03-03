import type { Route } from '../../../types/travel'
import SectionHeader from '../../../components/SectionHeader'
import RouteCard from './RouteCard'

type FeaturedRoutesSectionProps = {
  routes: Route[]
}

export default function FeaturedRoutesSection({ routes }: FeaturedRoutesSectionProps) {
  return (
    <section>
      <SectionHeader title="Популярные маршруты" description="Подборка лучших идей сообщества" />

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </section>
  )
}
