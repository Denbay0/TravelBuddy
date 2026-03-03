import type { Route } from '../../../types/travel'

type RouteCardProps = {
  route: Route
  onToggleSave?: (route: Route) => void
  isPending?: boolean
}

export default function RouteCard({ route, onToggleSave, isPending = false }: RouteCardProps) {
  return (
    <article className="card-surface overflow-hidden">
      <img src={route.cover} alt={route.title} className="h-52 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-semibold">{route.title}</h3>
        <p className="mt-2 text-sm text-ink/65">{route.cities.join(' → ')}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/75">
          <span className="rounded-full bg-sand px-3 py-1">{route.durationDays} дн.</span>
          <span className="rounded-full bg-sand px-3 py-1">{route.transport}</span>
          <span className="rounded-full bg-sand px-3 py-1">Сохранений: {route.saves}</span>
        </div>

        <p className="mt-4 text-sm text-ink/60">Автор: {route.author}</p>

        <div className="mt-4 flex gap-3">
          <button className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition hover:border-ink/40">
            Открыть
          </button>
          <button
            onClick={() => onToggleSave?.(route)}
            disabled={isPending}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {route.isSaved ? 'Убрать из сохранённых' : 'Сохранить'}
          </button>
        </div>
      </div>
    </article>
  )
}
