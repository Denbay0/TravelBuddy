import AppHeader from '../components/AppHeader'

export default function RoutesPage() {
  return (
    <div>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-semibold">Маршруты</h1>
        <p className="mt-4 max-w-2xl text-ink/70">
          Создавайте, сохраняйте и редактируйте маршруты поездок в одном месте. Соберите этапы,
          заметки и точки интереса, чтобы планировать путешествия быстрее.
        </p>
      </main>
    </div>
  )
}
