import PopularAuthorsCard from './PopularAuthorsCard'
import TrendingRoutesCard from './TrendingRoutesCard'

type FeedSidebarProps = {
  authors: Array<{ id: number; name: string; focus: string; avatarUrl: string }>
  routes: Array<{ id: number; name: string; meta: string }>
}

export default function FeedSidebar({ authors, routes }: FeedSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <PopularAuthorsCard authors={authors} />
      <TrendingRoutesCard routes={routes} />
      <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-glow">
        <h2 className="text-lg font-semibold text-ink">Редакционный совет</h2>
        <p className="mt-2 text-sm text-ink/65">
          Добавляйте короткие практические детали: как добраться, когда лучше ехать и что стоит
          сохранить в заметках.
        </p>
      </section>
    </aside>
  )
}
