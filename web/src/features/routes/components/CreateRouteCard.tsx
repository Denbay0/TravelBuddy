import { transportCategories, type TransportCategory } from '../../../types/travel'

export type CreateRouteFormState = {
  title: string
  stops: string
  duration: string
  transport: TransportCategory
  note: string
}

type CreateRouteCardProps = {
  form: CreateRouteFormState
  onChange: (field: keyof CreateRouteFormState, value: string) => void
  onSubmit: () => void
}

export default function CreateRouteCard({ form, onChange, onSubmit }: CreateRouteCardProps) {
  return (
    <section className="card-surface p-6">
      <h2 className="text-2xl font-semibold">Создать новый маршрут</h2>
      <p className="mt-2 text-sm text-ink/65">Заполните основные данные, чтобы добавить маршрут в каталог.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-ink/70">
          Название
          <input
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Например: Балканы за 10 дней"
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none transition focus:border-ink/35"
          />
        </label>

        <label className="text-sm text-ink/70">
          Города / остановки
          <input
            value={form.stops}
            onChange={(e) => onChange('stops', e.target.value)}
            placeholder="Белград, Сараево, Котор"
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none transition focus:border-ink/35"
          />
        </label>

        <label className="text-sm text-ink/70">
          Длительность (дней)
          <input
            value={form.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            placeholder="7"
            type="number"
            min={1}
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none transition focus:border-ink/35"
          />
        </label>

        <label className="text-sm text-ink/70">
          Транспорт
          <select
            value={form.transport}
            onChange={(e) => onChange('transport', e.target.value)}
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none transition focus:border-ink/35"
          >
            {transportCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm text-ink/70">
        Заметка
        <textarea
          value={form.note}
          onChange={(e) => onChange('note', e.target.value)}
          placeholder="Что важно учесть в поездке?"
          rows={3}
          className="mt-2 w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none transition focus:border-ink/35"
        />
      </label>

      <button
        onClick={onSubmit}
        className="mt-5 rounded-full bg-pine px-6 py-3 font-medium text-white transition hover:bg-pine/90"
      >
        Добавить маршрут
      </button>
    </section>
  )
}
