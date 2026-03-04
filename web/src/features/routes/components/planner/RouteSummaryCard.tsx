import type { TransportCategory } from '../../../../types/travel'

type Props = {
  distanceKm: number
  pointsCount: number
  transport: TransportCategory
  status: string
  routeType: 'real' | 'schematic'
}

export default function RouteSummaryCard({ distanceKm, pointsCount, transport, status, routeType }: Props) {
  return (
    <div className="rounded-2xl border border-borderline/70 bg-surface-elevated p-4 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div><div className="text-ink/60">Дистанция</div><div className="font-semibold">{distanceKm.toFixed(1)} км</div></div>
        <div><div className="text-ink/60">Точек</div><div className="font-semibold">{pointsCount}</div></div>
        <div><div className="text-ink/60">Транспорт</div><div className="font-semibold">{transport}</div></div>
        <div><div className="text-ink/60">Режим</div><div className="font-semibold">{routeType === 'real' ? 'Маршрут на карте' : 'Схематичный маршрут'}</div></div>
      </div>
      <div className="mt-3 rounded-xl bg-background-muted px-3 py-2 text-xs">{status}</div>
    </div>
  )
}
