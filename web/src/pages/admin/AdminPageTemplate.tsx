export default function AdminPageTemplate({ title, description }: { title: string; description: string }) {
  return (
    <section className="card-surface p-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-4 text-ink/70">{description}</p>
    </section>
  )
}
