import AppHeader from '../components/AppHeader'

export default function CommunityPage() {
  return (
    <div>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-semibold">Сообщество</h1>
        <p className="mt-4 max-w-2xl text-ink/70">
          Делитесь впечатлениями о поездках, находите полезные идеи от других путешественников и
          сохраняйте лучшие публикации в свои коллекции.
        </p>
      </main>
    </div>
  )
}
