import clsx from 'clsx'

export const routeFilterChips = [
  'По городам',
  'По странам',
  'По транспорту',
  'По длительности',
  'Популярные',
  'Новые',
  'Сохранённые',
] as const

export const routeSortOptions = ['Популярные', 'Новые', 'Короткие', 'Длинные'] as const

export type RouteSort = (typeof routeSortOptions)[number]

type RouteFiltersProps = {
  activeFilter: (typeof routeFilterChips)[number]
  onFilterChange: (chip: (typeof routeFilterChips)[number]) => void
  search: string
  onSearchChange: (value: string) => void
  sort: RouteSort
  onSortChange: (value: RouteSort) => void
}

export default function RouteFilters({
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
}: RouteFiltersProps) {
  return (
    <section className="card-surface p-5">
      <div className="flex flex-wrap gap-2">
        {routeFilterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => onFilterChange(chip)}
            className={clsx(
              'rounded-full border px-4 py-2 text-sm transition',
              activeFilter === chip
                ? 'border-ink bg-ink text-white'
                : 'border-ink/15 bg-white text-ink/75 hover:border-ink/35',
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по городам, странам или названию"
          className="rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none transition focus:border-ink/35"
        />
        <label className="flex items-center gap-2 text-sm text-ink/65">
          Сортировка
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as RouteSort)}
            className="rounded-xl border border-ink/15 bg-white px-3 py-2 outline-none transition focus:border-ink/35"
          >
            {routeSortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
