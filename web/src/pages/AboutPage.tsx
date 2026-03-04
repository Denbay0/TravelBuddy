export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <section className="card-surface p-8">
        <h1 className="text-3xl font-semibold">О продукте TravelBuddy</h1>
        <p className="mt-4 text-ink/80">TravelBuddy — учебный fullstack-продукт от команды FishingTeam. Мы строим удобный сервис для планирования поездок, маршрутов, travel-профилей и заметок сообщества.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-borderline/60 bg-surface p-4">
            <h2 className="font-semibold">Кто сделал</h2>
            <p className="mt-2 text-sm text-ink/75">Команда FishingTeam в формате учебной практики. Проект развивается итеративно и открыт для улучшений.</p>
          </article>
          <article className="rounded-2xl border border-borderline/60 bg-surface p-4">
            <h2 className="font-semibold">Чем полезен</h2>
            <p className="mt-2 text-sm text-ink/75">Помогает собирать маршруты, делиться поездками и хранить личную историю путешествий в одном месте.</p>
          </article>
        </div>
        <div className="mt-6">
          <h2 className="font-semibold">Что внутри</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/75">
            <li>Маршруты и карта с превью дистанции.</li>
            <li>Сообщество с публикациями и обсуждениями.</li>
            <li>Статистика поездок и travel-профиль.</li>
          </ul>
        </div>
        <p className="mt-6 text-sm text-ink/75">Контакт: <a className="text-accent underline" href="https://t.me/Denbay0" target="_blank" rel="noreferrer">Telegram @Denbay0</a></p>
      </section>
    </main>
  )
}
