import SectionHeader from '../../../components/SectionHeader'

type CommunityHeaderProps = {
  onShareTrip: () => void
  onCreatePost: () => void
}

export default function CommunityHeader({ onShareTrip, onCreatePost }: CommunityHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glow md:p-8">
      <SectionHeader
        badge="Лента сообщества"
        title="Истории, в которые хочется поехать"
        description="Спокойный поток поездок от участников TravelBuddy: маршруты, заметки о транспорте и кадры, которые помогают выбрать следующий вектор путешествия."
      />

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
