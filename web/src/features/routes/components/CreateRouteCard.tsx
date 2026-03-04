import { MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from 'react-leaflet'
import type { RoutePoint } from '../../../types/api'
import { transportCategories, type TransportCategory } from '../../../types/travel'

export type CreateRouteFormState = {
  title: string
  startLocation: string
  endLocation: string
  stops: string
  duration: string
  transport: TransportCategory
  note: string
}

type Point = RoutePoint

const fallbackCities: Record<string, [number, number]> = {
  москва: [55.7558, 37.6176],
  рим: [41.9028, 12.4964],
  рига: [56.9496, 24.1052],
  таллин: [59.437, 24.7536],
  париж: [48.8566, 2.3522],
}

async function geocodeCity(city: string): Promise<Point | null> {
  const key = city.toLowerCase().trim()
  if (fallbackCities[key]) {
    const [lat, lon] = fallbackCities[key]
    return { name: city, lat, lon }
  }
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`)
    const data = (await response.json()) as Array<{ lat: string; lon: string }>
    if (!data[0]) return null
    return { name: city, lat: Number(data[0].lat), lon: Number(data[0].lon) }
  } catch {
    return null
  }
}

type CreateRouteCardProps = {
  form: CreateRouteFormState
  onChange: (field: keyof CreateRouteFormState, value: string) => void
  onSubmit: () => void
  onPointsResolved?: (points: RoutePoint[]) => void
  distanceKm?: number
  submitLabel?: string
  submitHint?: string
}

function PointBadge({ index, total }: { index: number; total: number }) {
  if (index === 0) return <span className="rounded-full bg-pine/15 px-2 py-0.5 text-xs text-pine">Старт</span>
  if (index === total - 1) return <span className="rounded-full bg-amber/20 px-2 py-0.5 text-xs text-amber">Финиш</span>
  return <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">Остановка</span>
}

export default function CreateRouteCard({ form, onChange, onSubmit, onPointsResolved, distanceKm, submitLabel = 'Сохранить маршрут', submitHint }: CreateRouteCardProps) {
  const [points, setPoints] = useState<Point[]>([])
  const [isResolving, setIsResolving] = useState(false)

  const routeParts = useMemo(() => {
    const stops = form.stops
      .split(',')
      .map((city) => city.trim())
      .filter(Boolean)
    const base = [form.startLocation.trim(), ...stops, form.endLocation.trim()].filter(Boolean)
    return Array.from(new Set(base))
  }, [form.endLocation, form.startLocation, form.stops])

  useEffect(() => {
    async function loadPoints() {
      if (routeParts.length < 2) {
        setPoints([])
        onPointsResolved?.([])
        return
      }
      setIsResolving(true)
      const resolved = await Promise.all(routeParts.map(geocodeCity))
      const cleanPoints = resolved.filter(Boolean) as Point[]
      setPoints(cleanPoints)
      onPointsResolved?.(cleanPoints)
      setIsResolving(false)
    }
    void loadPoints()
  }, [routeParts, onPointsResolved])

  return (
    <section className="card-surface p-6">
      <h2 className="text-2xl font-semibold">Создать новый маршрут</h2>
      <p className="mt-2 text-sm text-ink/70">Логика маршрута: откуда → промежуточные точки → куда.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-ink/80">Название
          <input value={form.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Балканы за 10 дней" className="mt-2 w-full rounded-2xl border border-ink/20 bg-white/90 px-4 py-3 outline-none dark:bg-white/5" />
        </label>
        <label className="text-sm text-ink/80">Транспорт
          <select value={form.transport} onChange={(e) => onChange('transport', e.target.value)} className="mt-2 w-full rounded-2xl border border-ink/20 bg-white/90 px-4 py-3 outline-none dark:bg-white/5">{transportCategories.map((option) => <option key={option} value={option}>{option}</option>)}</select>
        </label>
        <label className="text-sm text-ink/80">Откуда
          <input value={form.startLocation} onChange={(e) => onChange('startLocation', e.target.value)} placeholder="Белград" className="mt-2 w-full rounded-2xl border border-ink/20 bg-white/90 px-4 py-3 outline-none dark:bg-white/5" />
        </label>
        <label className="text-sm text-ink/80">Куда
          <input value={form.endLocation} onChange={(e) => onChange('endLocation', e.target.value)} placeholder="Котор" className="mt-2 w-full rounded-2xl border border-ink/20 bg-white/90 px-4 py-3 outline-none dark:bg-white/5" />
        </label>
        <label className="text-sm text-ink/80 md:col-span-2">Промежуточные остановки (через запятую)
          <input value={form.stops} onChange={(e) => onChange('stops', e.target.value)} placeholder="Сараево, Мостар" className="mt-2 w-full rounded-2xl border border-ink/20 bg-white/90 px-4 py-3 outline-none dark:bg-white/5" />
        </label>
        <label className="text-sm text-ink/80">Длительность (дней)
          <input value={form.duration} onChange={(e) => onChange('duration', e.target.value)} placeholder="7" type="number" min={1} className="mt-2 w-full rounded-2xl border border-ink/20 bg-white/90 px-4 py-3 outline-none dark:bg-white/5" />
        </label>
      </div>

      <label className="mt-4 block text-sm text-ink/80">Заметка
        <textarea value={form.note} onChange={(e) => onChange('note', e.target.value)} placeholder="Что важно учесть в поездке?" rows={3} className="mt-2 w-full resize-none rounded-2xl border border-ink/20 bg-white/90 px-4 py-3 outline-none dark:bg-white/5" />
      </label>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-ink/80">
        {routeParts.map((city, index) => (
          <span key={`${city}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-3 py-1 dark:bg-white/5">
            <PointBadge index={index} total={routeParts.length} />
            {city}
          </span>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10">
        <MapContainer center={points[0] ? [points[0].lat, points[0].lon] : [55.7558, 37.6176]} zoom={4} className="h-72 w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {points.map((point, index) => <Marker key={`${point.name}-${point.lat}-${point.lon}-${index}`} position={[point.lat, point.lon]}><Tooltip>{point.name}</Tooltip></Marker>)}
          {points.length > 1 ? <Polyline positions={points.map((point) => [point.lat, point.lon])} pathOptions={{ color: '#D88752', weight: 5 }} /> : null}
        </MapContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="inline-flex items-center gap-2 rounded-full bg-ink/10 px-4 py-2 text-sm text-ink"><MapPin size={16} /> Примерная дистанция: <b>{Math.round(distanceKm ?? 0)} км</b></p>
        {isResolving ? <span className="text-sm text-ink/70">Обновляем маршрут на карте...</span> : null}
      </div>

      <button onClick={onSubmit} className="mt-5 rounded-full bg-pine px-6 py-3 font-medium text-white transition hover:bg-pine/90">{submitLabel}</button>
      {submitHint ? <p className="mt-2 text-sm text-ink/70">{submitHint}</p> : null}
    </section>
  )
}
