export interface LocationRecord {
  id: string
  /** ISO 8601 timestamp of when the record was saved. */
  timestamp: string
  lat: number
  lon: number
  /** Optional free-form description. Empty string means no description. */
  description: string
}

export interface NewLocation {
  lat: number
  lon: number
  description: string
}
