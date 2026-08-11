import { useEffect, useRef, useState } from 'react'
import { acquirePosition, type GeoResult } from '../lib/geolocation'

export type GpsState =
  | { status: 'idle' }
  | { status: 'acquiring' }
  | { status: 'acquired'; lat: number; lon: number; accuracy: number }
  | { status: 'error'; message: string }

/**
 * Runs a geolocation acquisition. `start` must be called from a user gesture
 * (button onClick) — iOS Safari refuses the permission prompt otherwise.
 */
export function useGpsAcquisition() {
  const [state, setState] = useState<GpsState>({ status: 'idle' })
  const requestId = useRef(0)

  const start = () => {
    const id = requestId.current + 1
    requestId.current = id
    setState({ status: 'acquiring' })

    acquirePosition().then((result: GeoResult) => {
      if (requestId.current !== id) return // superseded by a newer request
      if (result.ok) {
        setState({ status: 'acquired', lat: result.lat, lon: result.lon, accuracy: result.accuracy })
      } else {
        setState({ status: 'error', message: result.message })
      }
    })
  }

  useEffect(() => {
    return () => {
      requestId.current += 1 // invalidate any in-flight request on unmount
    }
  }, [])

  return { state, start }
}
