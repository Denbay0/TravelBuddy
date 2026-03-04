import type { User } from '../../../types/travel'
import type { TrendingRoute } from '../types'
import PopularAuthorsCard from './PopularAuthorsCard'
import TrendingRoutesCard from './TrendingRoutesCard'

type FeedSidebarProps = {
  authors: User[]
  routes: TrendingRoute[]
}

export default function FeedSidebar({ authors, routes }: FeedSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <PopularAuthorsCard authors={authors} />
      <TrendingRoutesCard routes={routes} />
      <section className="card-surface p-5 shadow-glow">
        <h2 className="text-lg font-semibold text-ink">Редакционный совет</h2>
        <p className="mt-2 text-sm text-ink/65">
          Добавляйте короткие практические детали: как добраться, когда лучше ехать и что стоит
          сохранить в заметках.
        </p>
      </section>
    </aside>
  )
}
