type CommunityHeaderProps = {
  onShareTrip: () => void
  onCreatePost: () => void
}

export default function CommunityHeader({ onShareTrip, onCreatePost }: CommunityHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glow md:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink/45">Лента сообщества</p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Истории, в которые хочется поехать</h1>
      <p className="mt-4 max-w-2xl text-sm text-ink/70 md:text-base">
        Спокойный поток поездок от участников TravelBuddy: маршруты, заметки о транспорте и кадры,
        которые помогают выбрать следующий вектор путешествия.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onShareTrip}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink/90"
        >
          Поделиться поездкой
        </button>
        <button
          onClick={onCreatePost}
          className="rounded-full border border-ink/20 bg-sand px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white"
        >
          Создать публикацию
        </button>
      </div>
    </section>
  )
}
