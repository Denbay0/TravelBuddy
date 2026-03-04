import type { FormEvent } from 'react'
import { transportCategories, type TransportCategory } from '../../../types/travel'

export type CommunityPostForm = {
  imageUrl: string
  caption: string
  route: string
  transport: TransportCategory
  date: string
}

type CreatePostModalProps = {
  isOpen: boolean
  form: CommunityPostForm
  onClose: () => void
  onChange: (field: keyof CommunityPostForm, value: string) => void
  onSubmit: () => void
}

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
    <div className="fixed inset-0 z-[60] bg-[rgb(var(--overlay))/0.55] px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto max-w-xl rounded-3xl border border-borderline/80 bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Новая публикация</h2>
            <p className="mt-1 text-sm text-ink/65">Добавьте момент, который вдохновит на поездку.</p>
          </div>
          <button onClick={onClose} className="btn-outline px-3 py-1 text-sm">
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
              className="form-control px-4 py-2.5"
            />
          </label>

          <label className="grid gap-1.5 text-sm text-ink/75">
            Локация или маршрут
            <input
              value={form.route}
              onChange={(event) => onChange('route', event.target.value)}
              placeholder="Рим — Флоренция"
              className="form-control px-4 py-2.5"
            />
          </label>

          <label className="grid gap-1.5 text-sm text-ink/75">
            Дата поездки
            <input
              type="date"
              value={form.date}
              onChange={(event) => onChange('date', event.target.value)}
              className="form-control px-4 py-2.5"
            />
          </label>

          <label className="grid gap-1.5 text-sm text-ink/75">
            Транспорт
            <select
              value={form.transport}
              onChange={(event) => onChange('transport', event.target.value)}
              className="form-control px-4 py-2.5"
            >
              {transportCategories.map((transport) => (
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
              className="form-control px-4 py-2.5"
            />
          </label>

          <button type="submit" className="btn-primary mt-2 px-5 py-2.5 text-sm">
            Опубликовать
          </button>
        </form>
      </div>
    </div>
  )
}
