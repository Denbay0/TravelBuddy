import { useEffect, useState } from 'react'
import { mapService } from '../../../../services/mapService'
import type { MapLocation } from '../../../../types/maps'

type Props = {
  label: string
  value: string
  onPick: (location: MapLocation) => void
}

export default function RouteLocationAutocomplete({ label, value, onPick }: Props) {
  const [query, setQuery] = useState(value)
  const [items, setItems] = useState<MapLocation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => setQuery(value), [value])

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setItems([])
        return
      }
      setIsLoading(true)
      try {
        setItems(await mapService.suggest(query))
      } catch {
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <label className="relative text-sm text-ink/80">{label}
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Начните вводить город" className="form-control mt-2" />
      {isLoading ? <div className="mt-2 text-xs text-ink/60">Загрузка подсказок...</div> : null}
      {items.length > 0 ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-borderline/70 bg-surface p-1 shadow-xl">
          {items.map((item, idx) => (
            <button key={`${item.lat}-${item.lon}-${idx}`} type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-elevated" onClick={() => { onPick(item); setQuery(item.label); setItems([]) }}>
              <div>{item.label}</div>
              <div className="text-xs text-ink/60">{item.city ?? item.country ?? 'Локация'}</div>
            </button>
          ))}
        </div>
      ) : null}
    </label>
  )
}
