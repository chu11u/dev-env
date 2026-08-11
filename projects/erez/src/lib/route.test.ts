import { describe, expect, it } from 'vitest'
import { MAX_ROUTE_POINTS, downsample, pinUrl, routeUrl, toCoordinate } from './route'
import type { LocationRecord } from './types'

function record(lat: number, lon: number, at = 0): LocationRecord {
  return { id: `r${at}`, timestamp: new Date(2026, 7, 11, 10, at).toISOString(), lat, lon, description: '' }
}

describe('toCoordinate', () => {
  it('formats coordinates to 6 decimal places', () => {
    expect(toCoordinate(32.0852999, 34.7817676)).toBe('32.085300,34.781768')
    expect(toCoordinate(-31.95224, 115.861397)).toBe('-31.952240,115.861397')
  })
})

describe('pinUrl', () => {
  it('builds the Google Maps search URL for exact coordinates', () => {
    const url = pinUrl(record(32.0853, 34.781768))
    expect(url).toBe('https://www.google.com/maps/search/?api=1&query=32.085300,34.781768')
  })
})

describe('downsample', () => {
  it('returns the input unchanged when at or under the limit', () => {
    const points = [record(0, 0, 0), record(1, 1, 1), record(2, 2, 2)]
    expect(downsample(points)).toEqual(points)
  })

  it('passes through exactly 12 points untouched', () => {
    const points = Array.from({ length: MAX_ROUTE_POINTS }, (_, i) => record(i, i, i))
    expect(downsample(points)).toHaveLength(MAX_ROUTE_POINTS)
    expect(downsample(points).map((p) => p.id)).toEqual(points.map((p) => p.id))
  })

  it('caps at 12 points and always keeps first and last', () => {
    const points = Array.from({ length: 20 }, (_, i) => record(i, i, i))
    const result = downsample(points)
    expect(result).toHaveLength(MAX_ROUTE_POINTS)
    expect(result[0]).toBe(points[0])
    expect(result[result.length - 1]).toBe(points[points.length - 1])
  })

  it('produces strictly increasing, duplicate-free indices', () => {
    for (const n of [13, 15, 20, 50, 100]) {
      const points = Array.from({ length: n }, (_, i) => record(i, i, i))
      const result = downsample(points)
      expect(result).toHaveLength(MAX_ROUTE_POINTS)
      const ids = result.map((p) => p.id)
      expect(new Set(ids).size).toBe(ids.length)
      const numericIds = ids.map((id) => Number(id.slice(1)))
      for (let i = 1; i < numericIds.length; i += 1) {
        expect(numericIds[i]).toBeGreaterThan(numericIds[i - 1])
      }
    }
  })

  it('keeps the intermediate distribution roughly even', () => {
    const n = 25
    const points = Array.from({ length: n }, (_, i) => record(i, i, i))
    const result = downsample(points)
    const ids = result.map((p) => Number(p.id.slice(1)))
    // interior gaps should be within one step of the ideal average gap
    const idealGap = (n - 1) / (MAX_ROUTE_POINTS - 1)
    for (let i = 1; i < ids.length; i += 1) {
      expect(Math.abs(ids[i] - ids[i - 1] - idealGap)).toBeLessThanOrEqual(1.01)
    }
  })

  it('handles tiny inputs', () => {
    expect(downsample([])).toEqual([])
    expect(downsample([record(0, 0)])).toHaveLength(1)
    expect(downsample([record(0, 0), record(1, 1)])).toHaveLength(2)
  })
})

describe('routeUrl', () => {
  it('builds origin/destination for exactly two points', () => {
    const points = [record(32.0853, 34.781768, 0), record(31.768319, 35.21371, 1)]
    const route = routeUrl(points)
    expect(route.url).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=32.085300,34.781768&destination=31.768319,35.213710',
    )
    expect(route.waypoints).toHaveLength(0)
    expect(route.included).toBe(2)
    expect(route.downsampled).toBe(false)
  })

  it('joins intermediate waypoints with pipes, in order', () => {
    const points = [
      record(0, 0, 0),
      record(1, 1, 1),
      record(2, 2, 2),
      record(3, 3, 3),
      record(4, 4, 4),
    ]
    const route = routeUrl(points)
    expect(route.url).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=0.000000,0.000000&destination=4.000000,4.000000&waypoints=1.000000,1.000000|2.000000,2.000000|3.000000,3.000000',
    )
    expect(route.waypoints).toHaveLength(3)
  })

  it('downsamples days with more than 12 points, keeping first origin and last destination', () => {
    const points = Array.from({ length: 30 }, (_, i) => record(i * 0.01, i * 0.02, i))
    const route = routeUrl(points)
    expect(route.total).toBe(30)
    expect(route.included).toBe(MAX_ROUTE_POINTS)
    expect(route.downsampled).toBe(true)
    expect(route.origin.id).toBe(points[0].id)
    expect(route.destination.id).toBe(points[points.length - 1].id)
    expect(route.url).toContain(`origin=${toCoordinate(points[0].lat, points[0].lon)}`)
    expect(route.url).toContain(`destination=${toCoordinate(points[30 - 1].lat, points[30 - 1].lon)}`)
  })

  it('throws when fewer than two points are given', () => {
    expect(() => routeUrl([record(0, 0, 0)])).toThrow()
    expect(() => routeUrl([])).toThrow()
  })
})
