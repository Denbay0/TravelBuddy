const posts = [
  { title: 'Как собрать маршрут на выходные за 15 минут', text: 'Используйте старт, финиш и 2–3 ключевые точки. TravelBuddy сразу покажет черновую дистанцию и поможет не перегрузить план.' },
  { title: 'Сценарий для мягкого slow-travel', text: 'Планируйте меньше городов, но больше времени в каждом. В сообществе можно сохранить заметки и вернуться к ним перед поездкой.' },
  { title: 'Что публиковать в travel-ленте', text: 'Лучше всего работают конкретные наблюдения: транспорт, бюджет, полезные места и 1-2 фото с коротким личным выводом.' },
]

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <section className="card-surface p-8">
        <h1 className="text-3xl font-semibold">Блог TravelBuddy</h1>
        <p className="mt-3 text-ink/75">Раздел пока в формате заметок, но уже с полезными материалами для планирования поездок.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="rounded-2xl border border-borderline/60 bg-surface p-4">
              <h2 className="font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm text-ink/75">{post.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
