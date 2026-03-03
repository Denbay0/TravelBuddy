import type { FormEvent } from 'react'

export type CommunityPostForm = {
  imageUrl: string
  caption: string
  route: string
  transport: string
  date: string
}

type CreatePostModalProps = {
  isOpen: boolean
  form: CommunityPostForm
  onClose: () => void
  onChange: (field: keyof CommunityPostForm, value: string) => void
  onSubmit: () => void
}

const transports = ['Самолёт', 'Поезд', 'Автомобиль', 'Автобус', 'Паром', 'Пешком']

export default function CreatePostModal({
  isOpen,
  form,
  onClose,
  onChange,
  onSubmit,
}: CreatePostModalProps) {
  if (!isOpen) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-ink/35 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto max-w-xl rounded-3xl border border-white/80 bg-[#f9f6f0] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Новая публикация</h2>
            <p className="mt-1 text-sm text-ink/65">Добавьте момент, который вдохновит на поездку.</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-ink/20 px-3 py-1 text-sm text-ink/70">
            Закрыть
          </button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm text-ink/75">
            Ссылка на фото
            <input
              value={form.imageUrl}
              onChange={(event) => onChange('imageUrl', event.target.value)}
              placeholder="https://..."
              className="rounded-2xl border border-ink/15 bg-white px-4 py-2.5 outline-none transition focus:border-ink/30"
            />
          </label>

          <label className="grid gap-1.5 text-sm text-ink/75">
            Локация или маршрут
            <input
              value={form.route}
              onChange={(event) => onChange('route', event.target.value)}
              placeholder="Рим — Флоренция"
              className="rounded-2xl border border-ink/15 bg-white px-4 py-2.5 outline-none transition focus:border-ink/30"
            />
          </label>

          <label className="grid gap-1.5 text-sm text-ink/75">
            Дата поездки
            <input
              type="date"
              value={form.date}
              onChange={(event) => onChange('date', event.target.value)}
              className="rounded-2xl border border-ink/15 bg-white px-4 py-2.5 outline-none transition focus:border-ink/30"
            />
          </label>

          <label className="grid gap-1.5 text-sm text-ink/75">
            Транспорт
            <select
              value={form.transport}
              onChange={(event) => onChange('transport', event.target.value)}
              className="rounded-2xl border border-ink/15 bg-white px-4 py-2.5 outline-none transition focus:border-ink/30"
            >
              {transports.map((transport) => (
                <option key={transport} value={transport}>
                  {transport}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm text-ink/75">
            Подпись
            <textarea
              value={form.caption}
              onChange={(event) => onChange('caption', event.target.value)}
              rows={4}
              placeholder="Небольшая заметка о впечатлениях и полезных деталях маршрута."
              className="rounded-2xl border border-ink/15 bg-white px-4 py-2.5 outline-none transition focus:border-ink/30"
            />
          </label>

          <button type="submit" className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white">
            Опубликовать
          </button>
        </form>
      </div>
    </div>
  )
}
