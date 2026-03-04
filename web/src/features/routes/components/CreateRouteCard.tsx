import { useEffect, useMemo, useState } from 'react'
import { env } from '../../../config/env'
import { mapService } from '../../../services/mapService'
import type { MapLocation, RoutePreviewResponse } from '../../../types/maps'
import { transportCategories, type TransportCategory } from '../../../types/travel'
import RouteLocationAutocomplete from './planner/RouteLocationAutocomplete'
import RoutePlannerMap from './planner/RoutePlannerMap'
import RouteSummaryCard from './planner/RouteSummaryCard'
import RouteWaypointsEditor from './planner/RouteWaypointsEditor'

export type CreateRouteFormState = {
  title: string
  duration: string
  transport: TransportCategory
  note: string
}

type Props = {
  form: CreateRouteFormState
  onChange: (field: keyof CreateRouteFormState, value: string) => void
  onSubmit: (payload: { origin: MapLocation | null; destination: MapLocation | null; waypoints: MapLocation[]; preview: RoutePreviewResponse | null }) => void
  submitLabel?: string
  submitHint?: string
}

export default function CreateRouteCard({ form, onChange, onSubmit, submitLabel = 'Сохранить маршрут', submitHint }: Props) {
  const [origin, setOrigin] = useState<MapLocation | null>(null)
  const [destination, setDestination] = useState<MapLocation | null>(null)
  const [originQuery, setOriginQuery] = useState('')
  const [destinationQuery, setDestinationQuery] = useState('')
  const [waypoints, setWaypoints] = useState<MapLocation[]>([])
  const [preview, setPreview] = useState<RoutePreviewResponse | null>(null)
  const [status, setStatus] = useState('Выберите города из подсказок')
  const [isLoading, setIsLoading] = useState(false)

  const points = useMemo(() => (origin && destination ? [origin, ...waypoints, destination] : []), [origin, destination, waypoints])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!originQuery.trim() || !destinationQuery.trim()) {
        setStatus('Введите города отправления и прибытия')
        setPreview(null)
        return
      }

      if (!origin || !destination) {
        setStatus('Выберите город из подсказок')
        setPreview(null)
        return
      }

      setIsLoading(true)
      try {
        const response = await mapService.previewRoute({
          transport: form.transport,
          origin: { name: origin.label, lat: origin.lat, lon: origin.lon },
          destination: { name: destination.label, lat: destination.lat, lon: destination.lon },
          waypoints: waypoints.map((point) => ({ name: point.label, lat: point.lat, lon: point.lon })),
        })
        setPreview(response)
        setStatus(response.warnings[0] ?? 'Маршрут рассчитан')
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Нет совпадений по точкам')
        setPreview(null)
      } finally {
        setIsLoading(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [destination, destinationQuery, form.transport, origin, originQuery, waypoints])

  const styleUrl = env.geoapifyStyleUrl || `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${env.geoapifyMapKey}`
  const hasMapConfig = Boolean(env.geoapifyMapKey || env.geoapifyStyleUrl)

  return (
    <section className="card-surface p-5 sm:p-6">
      <h2 className="text-2xl font-semibold">Конструктор маршрута</h2>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(340px,440px)_1fr]">
        <div className="space-y-3">
          <label className="text-sm text-ink/80">Название
            <input value={form.title} onChange={(e) => onChange('title', e.target.value)} className="form-control mt-2" />
          </label>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <RouteLocationAutocomplete
              label="Откуда"
              value={originQuery}
              onPick={(item) => {
                setOrigin(item)
                setOriginQuery(item.label)
              }}
              onQueryChange={(nextValue) => {
                setOriginQuery(nextValue)
                if (origin && nextValue !== origin.label) {
                  setOrigin(null)
                }
              }}
            />
            <RouteLocationAutocomplete
              label="Куда"
              value={destinationQuery}
              onPick={(item) => {
                setDestination(item)
                setDestinationQuery(item.label)
              }}
              onQueryChange={(nextValue) => {
                setDestinationQuery(nextValue)
                if (destination && nextValue !== destination.label) {
                  setDestination(null)
                }
              }}
            />
            <RouteWaypointsEditor waypoints={waypoints} onAdd={(point) => setWaypoints((prev) => [...prev, point])} onRemove={(index) => setWaypoints((prev) => prev.filter((_, i) => i !== index))} />
          </div>

          <label className="text-sm text-ink/80">Транспорт
            <select value={form.transport} onChange={(e) => onChange('transport', e.target.value)} className="form-control mt-2">{transportCategories.map((option) => <option key={option}>{option}</option>)}</select>
          </label>
          <label className="text-sm text-ink/80">Длительность
            <input type="number" min={1} value={form.duration} onChange={(e) => onChange('duration', e.target.value)} className="form-control mt-2" />
          </label>
          <label className="text-sm text-ink/80">Заметка
            <textarea value={form.note} onChange={(e) => onChange('note', e.target.value)} className="form-control mt-2 min-h-24" />
          </label>

          <RouteSummaryCard distanceKm={preview?.distanceKm ?? 0} pointsCount={points.length} transport={form.transport} routeType={preview?.routeType ?? 'schematic'} status={isLoading ? 'Пересчитываем маршрут...' : status} />
          <button className="btn-primary w-full" onClick={() => onSubmit({ origin, destination, waypoints, preview })} disabled={!origin || !destination}>{submitLabel}</button>
          {submitHint ? <p className="text-xs text-ink/70">{submitHint}</p> : null}
        </div>

        <div>
          {!hasMapConfig ? <div className="rounded-2xl border border-amber/40 bg-amber/10 p-4 text-sm">Добавьте VITE_GEOAPIFY_MAP_KEY или VITE_GEOAPIFY_STYLE_URL для отображения карты.</div> : <RoutePlannerMap points={(preview?.points ?? points).map((p) => ({ name: 'label' in p ? p.label : p.name, lat: p.lat, lon: p.lon }))} geojson={preview?.geojson} routeType={preview?.routeType ?? 'schematic'} styleUrl={styleUrl} />}
        </div>
      </div>
    </section>
  )
}
