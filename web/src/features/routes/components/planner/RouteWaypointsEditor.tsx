import RouteLocationAutocomplete from './RouteLocationAutocomplete'
import type { MapLocation } from '../../../../types/maps'

type Props = {
  waypoints: MapLocation[]
  onAdd: (point: MapLocation) => void
  onRemove: (index: number) => void
}

export default function RouteWaypointsEditor({ waypoints, onAdd, onRemove }: Props) {
  return (
    <div className="space-y-2 md:col-span-2">
      <RouteLocationAutocomplete label="Промежуточные остановки" value="" onPick={onAdd} />
      <div className="flex flex-wrap gap-2">
        {waypoints.map((point, index) => (
          <span className="tag-chip inline-flex items-center gap-2" key={`${point.lat}-${point.lon}-${index}`}>
            {point.label}
            <button type="button" onClick={() => onRemove(index)} className="rounded-full border px-2">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}
