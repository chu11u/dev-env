export type GeoError =
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'unsupported'
  | 'unknown'

export interface GeoSuccess {
  ok: true
  lat: number
  lon: number
  accuracy: number
}

export interface GeoFailure {
  ok: false
  error: GeoError
  message: string
}

export type GeoResult = GeoSuccess | GeoFailure

const HIGH_ACCURACY_OPTS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 0,
}

const COARSE_FALLBACK_OPTS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 30_000,
}

function getPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

function describeError(code: number | undefined): GeoFailure {
  switch (code) {
    case 1:
      return {
        ok: false,
        error: 'permission-denied',
        message:
          'Location permission was denied. Enable location access for this site in your browser settings, then try again.',
      }
    case 2:
      return {
        ok: false,
        error: 'position-unavailable',
        message: 'Your position could not be determined. Move to a spot with a clearer view of the sky and try again.',
      }
    case 3:
      return {
        ok: false,
        error: 'timeout',
        message: 'Getting a GPS fix timed out. Check that GPS is on and try again.',
      }
    default:
      return {
        ok: false,
        error: 'unknown',
        message: 'An unknown error occurred while getting your location.',
      }
  }
}

function toSuccess(position: GeolocationPosition): GeoSuccess {
  return {
    ok: true,
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    accuracy: position.coords.accuracy,
  }
}

/**
 * Acquires the user's position.
 *
 * Strategy: request a high-accuracy fix first (10s budget). If that times out
 * or is unavailable — but not when permission was denied — fall back to a
 * single coarse fix so the user can still log their location.
 *
 * IMPORTANT: on iOS Safari the permission prompt is only shown when this call
 * originates from a user gesture (e.g. a button onClick), so callers must
 * invoke this synchronously from a click handler.
 */
export async function acquirePosition(): Promise<GeoResult> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return {
      ok: false,
      error: 'unsupported',
      message: 'Geolocation is not supported in this browser or the page is not served over HTTPS.',
    }
  }

  try {
    const position = await getPosition(HIGH_ACCURACY_OPTS)
    return toSuccess(position)
  } catch (err) {
    const code = (err as GeolocationPositionError | undefined)?.code
    if (code === 1) return describeError(code)

    try {
      const position = await getPosition(COARSE_FALLBACK_OPTS)
      return toSuccess(position)
    } catch (fallbackErr) {
      return describeError((fallbackErr as GeolocationPositionError | undefined)?.code)
    }
  }
}
