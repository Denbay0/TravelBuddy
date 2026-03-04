import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef } from 'react'

type Props = {
  points: { name: string; lat: number; lon: number }[]
  geojson?: GeoJSON.Feature | null
  routeType: 'real' | 'schematic'
  styleUrl: string
}

const ROUTE_SOURCE_ID = 'route-line'
const POINT_SOURCE_ID = 'route-points'

export default function RoutePlannerMap({ points, geojson, routeType, styleUrl }: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const lineGeojson = useMemo<GeoJSON.Feature>(
    () =>
      geojson ?? {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: points.map((point) => [point.lon, point.lat]) },
        properties: {},
      },
    [geojson, points],
  )

  const pointsGeojson = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: points.map((point) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [point.lon, point.lat] },
        properties: { name: point.name },
      })),
    }),
    [points],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [37.6176, 55.7558],
      zoom: 4,
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [styleUrl])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const applyStyle = () => map.setStyle(styleUrl)

    if (map.getStyle()) {
      applyStyle()
      return
    }

    map.once('load', applyStyle)
    return () => {
      map.off('load', applyStyle)
    }
  }, [styleUrl])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const syncLayers = () => {
      if (!map.getSource(ROUTE_SOURCE_ID)) {
        map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: lineGeojson })
        map.addLayer({
          id: ROUTE_SOURCE_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          paint: {
            'line-color': routeType === 'real' ? '#2a72f0' : '#e79236',
            'line-width': 5,
            'line-dasharray': routeType === 'real' ? [1, 0] : [2, 2],
          },
        })
      } else {
        ;(map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource).setData(lineGeojson)
        map.setPaintProperty(ROUTE_SOURCE_ID, 'line-color', routeType === 'real' ? '#2a72f0' : '#e79236')
        map.setPaintProperty(ROUTE_SOURCE_ID, 'line-dasharray', routeType === 'real' ? [1, 0] : [2, 2])
      }

      if (!map.getSource(POINT_SOURCE_ID)) {
        map.addSource(POINT_SOURCE_ID, { type: 'geojson', data: pointsGeojson })
        map.addLayer({
          id: POINT_SOURCE_ID,
          type: 'circle',
          source: POINT_SOURCE_ID,
          paint: {
            'circle-radius': 6,
            'circle-color': '#16a34a',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
          },
        })
      } else {
        ;(map.getSource(POINT_SOURCE_ID) as maplibregl.GeoJSONSource).setData(pointsGeojson)
      }

      if (points.length > 1) {
        const bounds = new maplibregl.LngLatBounds()
        points.forEach((point) => bounds.extend([point.lon, point.lat]))
        map.fitBounds(bounds, { padding: 48, maxZoom: 12 })
      }
    }

    if (map.isStyleLoaded()) {
      syncLayers()
      return
    }

    map.once('load', syncLayers)
    return () => {
      map.off('load', syncLayers)
    }
  }, [lineGeojson, pointsGeojson, points, routeType])

  return <div ref={containerRef} className="h-[560px] w-full rounded-3xl border border-borderline/70" />
}
