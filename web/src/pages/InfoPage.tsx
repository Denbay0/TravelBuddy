export default function InfoPage({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <section className="card-surface p-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-4 text-ink/70">
          Раздел находится в проработке. Скоро здесь появится полноценный контент TravelBuddy.
        </p>
      </section>
    </main>
  )
}
