import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'

type Props = {
  points: { name: string; lat: number; lon: number }[]
  geojson?: GeoJSON.Feature | null
  routeType: 'real' | 'schematic'
  styleUrl: string
}

export default function RoutePlannerMap({ points, geojson, routeType, styleUrl }: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = new maplibregl.Map({ container: containerRef.current, style: styleUrl, center: [37.6176, 55.7558], zoom: 4 })
    return () => mapRef.current?.remove()
  }, [styleUrl])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const sourceId = 'route-line'
    const pointSourceId = 'route-points'

    const lineGeojson: GeoJSON.Feature = geojson ?? {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: points.map((point) => [point.lon, point.lat]) },
      properties: {},
    }

    if (map.getSource(sourceId)) {
      ;(map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(lineGeojson)
      ;(map.getSource(pointSourceId) as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: points.map((point) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [point.lon, point.lat] }, properties: { name: point.name } })) })
      return
    }

    map.on('load', () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: 'geojson', data: lineGeojson })
        map.addLayer({ id: sourceId, type: 'line', source: sourceId, paint: { 'line-color': routeType === 'real' ? '#2a72f0' : '#e79236', 'line-width': 5, 'line-dasharray': routeType === 'real' ? [1, 0] : [2, 2] } })

        map.addSource(pointSourceId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: points.map((point) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [point.lon, point.lat] }, properties: { name: point.name } })) },
        })
        map.addLayer({ id: pointSourceId, type: 'circle', source: pointSourceId, paint: { 'circle-radius': 6, 'circle-color': '#16a34a', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } })
      }
    })

    if (points.length > 1) {
      const bounds = new maplibregl.LngLatBounds()
      points.forEach((point) => bounds.extend([point.lon, point.lat]))
      map.fitBounds(bounds, { padding: 48, maxZoom: 12 })
    }
  }, [geojson, points, routeType])

  return <div ref={containerRef} className="h-[560px] w-full rounded-3xl border border-borderline/70" />
}
