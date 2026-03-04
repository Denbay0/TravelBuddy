import { MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { transportCategories, type TransportCategory } from '../../../types/travel'

export type CreateRouteFormState = {
  title: string
  stops: string
  duration: string
  transport: TransportCategory
  note: string
}

type Point = { name: string; lat: number; lon: number }

const fallbackCities: Record<string, [number, number]> = {
  москва: [55.7558, 37.6176],
  рим: [41.9028, 12.4964],
  рига: [56.9496, 24.1052],
  таллин: [59.437, 24.7536],
  париж: [48.8566, 2.3522],
  берлин: [52.52, 13.405],
}

async function geocodeCity(city: string): Promise<Point | null> {
  const key = city.toLowerCase().trim()

  if (fallbackCities[key]) {
    const [lat, lon] = fallbackCities[key]
    return { name: city, lat, lon }
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
    )
    const data = (await response.json()) as Array<{ lat: string; lon: string }>
    if (!data[0]) return null
    return { name: city, lat: Number(data[0].lat), lon: Number(data[0].lon) }
  } catch {
    return null
  }
}

function haversine(a: Point, b: Point) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

function getSvgPolyline(points: Point[]) {
  if (points.length < 2) return ''
  const lats = points.map((p) => p.lat)
  const lons = points.map((p) => p.lon)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)

  return points
    .map((point) => {
      const x = ((point.lon - minLon) / (maxLon - minLon || 1)) * 92 + 4
      const y = 96 - (((point.lat - minLat) / (maxLat - minLat || 1)) * 92 + 4)
      return `${x},${y}`
    })
    .join(' ')
}

type CreateRouteCardProps = {
  form: CreateRouteFormState
  onChange: (field: keyof CreateRouteFormState, value: string) => void
  onSubmit: () => void
}

export default function CreateRouteCard({ form, onChange, onSubmit }: CreateRouteCardProps) {
  const [points, setPoints] = useState<Point[]>([])

  const cities = useMemo(
    () => form.stops.split(',').map((city) => city.trim()).filter(Boolean),
    [form.stops],
  )

  useEffect(() => {
    async function loadPoints() {
      const resolved = await Promise.all(cities.map(geocodeCity))
      setPoints(resolved.filter(Boolean) as Point[])
    }

    void loadPoints()
  }, [cities])

  const totalDistance = useMemo(() => {
    if (points.length < 2) return 0
    return points.slice(1).reduce((sum, point, index) => sum + haversine(points[index], point), 0)
  }, [points])

  const polyline = useMemo(() => getSvgPolyline(points), [points])

  return (
    <section className="card-surface p-6">
      <h2 className="text-2xl font-semibold">Создать новый маршрут</h2>
      <p className="mt-2 text-sm text-ink/65">Заполните данные и проверьте схему маршрута и дистанцию.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-ink/70">
          Название
          <input
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder="Балканы за 10 дней"
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none dark:bg-white/10"
          />
        </label>

        <label className="text-sm text-ink/70">
          Города / остановки
          <input
            value={form.stops}
            onChange={(event) => onChange('stops', event.target.value)}
            placeholder="Белград, Сараево, Котор"
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none dark:bg-white/10"
          />
        </label>

        <label className="text-sm text-ink/70">
          Длительность (дней)
          <input
            value={form.duration}
            onChange={(event) => onChange('duration', event.target.value)}
            placeholder="7"
            type="number"
            min={1}
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none dark:bg-white/10"
          />
        </label>

        <label className="text-sm text-ink/70">
          Транспорт
          <select
            value={form.transport}
            onChange={(event) => onChange('transport', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none dark:bg-white/10"
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
          onChange={(event) => onChange('note', event.target.value)}
          placeholder="Что важно учесть в поездке?"
          rows={3}
          className="mt-2 w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none dark:bg-white/10"
        />
      </label>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-4 dark:bg-white/5">
        <p className="mb-3 text-sm font-medium text-ink/80">Предпросмотр маршрута</p>
        <svg viewBox="0 0 100 100" className="h-52 w-full rounded-xl bg-sand/60 dark:bg-[#1f2634]">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeOpacity="0.08" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          {polyline ? <polyline points={polyline} fill="none" stroke="#D88752" strokeWidth="1.8" /> : null}
          {polyline
            ? polyline.split(' ').map((point, index) => {
                const [cx, cy] = point.split(',')
                return (
                  <g key={point}>
                    <circle cx={cx} cy={cy} r="2.4" fill="#325E56" />
                    <text x={Number(cx) + 2.6} y={Number(cy) - 2.2} fontSize="3" fill="currentColor">
                      {points[index]?.name}
                    </text>
                  </g>
                )
              })
            : null}
        </svg>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-sm text-ink/80">
        <MapPin size={16} />
        Примерная дистанция: <b>{Math.round(totalDistance)} км</b>
      </p>

      <button
        onClick={onSubmit}
        className="mt-5 rounded-full bg-pine px-6 py-3 font-medium text-white transition hover:bg-pine/90"
      >
        Добавить маршрут
      </button>
    </section>
  )
}
