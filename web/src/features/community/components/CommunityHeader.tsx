import SectionHeader from '../../../components/SectionHeader'

type CommunityHeaderProps = {
  onCreatePost: () => void
}

export default function CommunityHeader({ onCreatePost }: CommunityHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glow md:p-8 dark:border-white/10 dark:bg-white/5">
      <SectionHeader
        badge="Лента сообщества"
        title="Истории, в которые хочется поехать"
        description="Спокойный поток поездок от участников TravelBuddy: маршруты, заметки о транспорте и кадры, которые помогают выбрать следующий вектор путешествия."
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onCreatePost} className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink/90">Поделиться поездкой</button>
      </div>
    </section>
  )
}
