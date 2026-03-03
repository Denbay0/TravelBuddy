import type { TrendingRoute } from '../types'

type TrendingRoutesCardProps = {
  routes: TrendingRoute[]
}

export default function TrendingRoutesCard({ routes }: TrendingRoutesCardProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-glow">
      <h2 className="text-lg font-semibold text-ink">Трендовые маршруты</h2>
      <p className="mt-1 text-sm text-ink/65">Актуальные идеи на ближайшие выходные и короткие отпуска.</p>
      <ul className="mt-4 space-y-3">
        {routes.map((route) => (
          <li key={route.id} className="rounded-2xl border border-ink/10 bg-sand/80 px-3 py-2.5">
            <p className="text-sm font-medium text-ink">{route.name}</p>
            <p className="text-xs text-ink/60">{route.meta}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
