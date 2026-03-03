import SearchBar from '../../../components/SearchBar'
import TransportFilterChips from '../../../components/TransportFilterChips'
import type { RouteFilter } from '../../../types/travel'
import { routeSortOptions, type RouteSort, routeFilterChips } from './routeFiltersConfig'

type RouteFiltersProps = {
  activeFilter: RouteFilter
  onFilterChange: (chip: RouteFilter) => void
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
      <TransportFilterChips items={routeFilterChips} active={activeFilter} onChange={onFilterChange} />

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Поиск по городам, странам или названию"
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
