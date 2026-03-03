export default function RoutesHero() {
  return (
    <section className="bg-hero-gradient px-6 pb-12 pt-14">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex rounded-full border border-amber/30 bg-white/70 px-4 py-2 text-sm text-amber">
          Каталог маршрутов TravelBuddy
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Открывайте готовые маршруты и создавайте свои путешествия за пару минут
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/70">
          Выбирайте направление, фильтруйте по транспорту и длительности, сохраняйте лучшие идеи
          и собирайте личный план поездки.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button className="rounded-full bg-ink px-6 py-3 font-medium text-white transition hover:bg-ink/90">
            Создать маршрут
          </button>
          <button className="rounded-full border border-ink/20 bg-white/80 px-6 py-3 font-medium transition hover:bg-white">
            Смотреть популярные
          </button>
        </div>
      </div>
    </section>
  )
}
