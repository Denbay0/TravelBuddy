type PopularAuthor = {
  id: number
  name: string
  focus: string
  avatarUrl: string
}

type PopularAuthorsCardProps = {
  authors: PopularAuthor[]
}

export default function PopularAuthorsCard({ authors }: PopularAuthorsCardProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-glow">
      <h2 className="text-lg font-semibold text-ink">Популярные авторы</h2>
      <p className="mt-1 text-sm text-ink/65">Следите за теми, кто пишет о маршрутах спокойно и по делу.</p>
      <ul className="mt-4 space-y-3">
        {authors.map((author) => (
          <li key={author.id} className="flex items-center gap-3">
            <img src={author.avatarUrl} alt={author.name} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium text-ink">{author.name}</p>
              <p className="text-xs text-ink/60">{author.focus}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
