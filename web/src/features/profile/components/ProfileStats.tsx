import type { ProfileStats as ProfileStatsType } from '../types'

type ProfileStatsProps = {
  stats: ProfileStatsType
}

const statItems = (stats: ProfileStatsType) => [
  { label: 'Поездок', value: stats.trips },
  { label: 'Постов', value: stats.posts },
  { label: 'Сохранённых маршрутов', value: stats.savedRoutes },
  { label: 'Любимый транспорт', value: stats.favoriteTransport },
]

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {statItems(stats).map((item) => (
        <article key={item.label} className="rounded-2xl border border-borderline/70 bg-surface-elevated px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-ink/55">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{item.value}</p>
        </article>
      ))}
    </div>
  )
}
