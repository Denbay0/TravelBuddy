import SectionHeader from '../../../components/SectionHeader'

type CommunityHeaderProps = {
  onCreatePost: () => void
  createLabel?: string
  createHint?: string
}

export default function CommunityHeader({ onCreatePost, createLabel = 'Поделиться поездкой', createHint }: CommunityHeaderProps) {
  return (
    <section className="rounded-3xl border border-borderline/70 bg-surface p-6 shadow-glow md:p-8">
      <SectionHeader
        badge="Лента сообщества"
        title="Истории, в которые хочется поехать"
        description="Спокойный поток поездок от участников TravelBuddy: маршруты, заметки о транспорте и кадры, которые помогают выбрать следующий вектор путешествия."
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          data-testid="community-create-post-button"
          onClick={onCreatePost}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[rgb(var(--color-accent-contrast))] transition hover:opacity-90"
        >
          {createLabel}
        </button>
      </div>
      {createHint ? <p className="mt-3 text-sm text-muted">{createHint}</p> : null}
    </section>
  )
}
