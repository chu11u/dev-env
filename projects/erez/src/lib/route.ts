import type { LocationRecord } from './types'

/**
 * Google Maps Directions supports at most 10 waypoints on top of a single
 * origin and destination — 12 points in total.
 */
export const MAX_ROUTE_POINTS = 12
export const MAX_WAYPOINTS = MAX_ROUTE_POINTS - 2

/** Formats a coordinate pair for use in Google Maps URLs. */
export function toCoordinate(lat: number, lon: number): string {
  return `${lat.toFixed(6)},${lon.toFixed(6)}`
}

/** Link that drops a pin at the exact coordinates of a record. */
export function pinUrl(record: LocationRecord): string {
  return `https://www.google.com/maps/search/?api=1&query=${toCoordinate(record.lat, record.lon)}`
}

/**
 * Downsamples an ordered list to at most `max` items while always keeping the
 * first and last elements. Intermediate points are picked at evenly spaced
 * indices so the route stays representative of the full day.
 */
export function downsample<T>(points: readonly T[], max: number = MAX_ROUTE_POINTS): T[] {
  if (points.length <= max) return [...points]
  const keep = max - 2
  const indices = new Set<number>([0, points.length - 1])
  for (let i = 1; i <= keep; i += 1) {
    indices.add(Math.round((i * (points.length - 1)) / (keep + 1)))
  }
  return [...indices].sort((a, b) => a - b).map((i) => points[i])
}

export interface RouteLink {
  url: string
  /** Number of points originally logged for the day. */
  total: number
  /** Number of points included in the route after (possible) downsampling. */
  included: number
  origin: LocationRecord
  destination: LocationRecord
  waypoints: LocationRecord[]
  /** True when the day had more points than Google Maps allows. */
  downsampled: boolean
}

/**
 * Builds a Google Maps multi-stop directions link for the given points,
 * which must be in chronological order (first = origin, last = destination).
 * Throws if fewer than 2 points are provided.
 */
export function routeUrl(points: readonly LocationRecord[]): RouteLink {
  if (points.length < 2) {
    throw new Error('A route requires at least 2 points.')
  }

  const sampled = downsample(points)
  const [origin, ...rest] = sampled
  const destination = rest[rest.length - 1]
  const waypoints = rest.slice(0, -1)

  const originCoord = toCoordinate(origin.lat, origin.lon)
  const destinationCoord = toCoordinate(destination.lat, destination.lon)

  let url = `https://www.google.com/maps/dir/?api=1&origin=${originCoord}&destination=${destinationCoord}`
  if (waypoints.length > 0) {
    url += `&waypoints=${waypoints.map((w) => toCoordinate(w.lat, w.lon)).join('|')}`
  }

  return {
    url,
    total: points.length,
    included: sampled.length,
    origin,
    destination,
    waypoints,
    downsampled: sampled.length < points.length,
  }
}
