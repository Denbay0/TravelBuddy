import { MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from 'react-leaflet'
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

function haversine(a: Point, b: Point) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

type CreateRouteCardProps = {
  form: CreateRouteFormState
  onChange: (field: keyof CreateRouteFormState, value: string) => void
  onSubmit: () => void
}

export default function CreateRouteCard({ form, onChange, onSubmit }: CreateRouteCardProps) {
  const [points, setPoints] = useState<Point[]>([])
  const cities = useMemo(() => form.stops.split(',').map((city) => city.trim()).filter(Boolean), [form.stops])

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

  return (
    <section className="card-surface p-6">
      <h2 className="text-2xl font-semibold">Создать новый маршрут</h2>
      <p className="mt-2 text-sm text-ink/65">Заполните данные и проверьте маршрут на карте.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-ink/70">Название
          <input value={form.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Балканы за 10 дней" className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none" />
        </label>
        <label className="text-sm text-ink/70">Города / остановки
          <input value={form.stops} onChange={(e) => onChange('stops', e.target.value)} placeholder="Белград, Сараево, Котор" className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none" />
        </label>
        <label className="text-sm text-ink/70">Длительность (дней)
          <input value={form.duration} onChange={(e) => onChange('duration', e.target.value)} placeholder="7" type="number" min={1} className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none" />
        </label>
        <label className="text-sm text-ink/70">Транспорт
          <select value={form.transport} onChange={(e) => onChange('transport', e.target.value)} className="mt-2 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none">{transportCategories.map((option) => <option key={option} value={option}>{option}</option>)}</select>
        </label>
      </div>

      <label className="mt-4 block text-sm text-ink/70">Заметка
        <textarea value={form.note} onChange={(e) => onChange('note', e.target.value)} placeholder="Что важно учесть в поездке?" rows={3} className="mt-2 w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none" />
      </label>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10">
        <MapContainer center={points[0] ? [points[0].lat, points[0].lon] : [55.7558, 37.6176]} zoom={4} className="h-64 w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {points.map((point) => <Marker key={`${point.name}-${point.lat}`} position={[point.lat, point.lon]}><Tooltip>{point.name}</Tooltip></Marker>)}
          {points.length > 1 ? <Polyline positions={points.map((point) => [point.lat, point.lon])} pathOptions={{ color: "#D88752" }} /> : null}
        </MapContainer>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-sm text-ink/80"><MapPin size={16} /> Примерная дистанция: <b>{Math.round(totalDistance)} км</b></p>

      <button onClick={onSubmit} className="mt-5 rounded-full bg-pine px-6 py-3 font-medium text-white transition hover:bg-pine/90">Добавить маршрут</button>
    </section>
  )
}
