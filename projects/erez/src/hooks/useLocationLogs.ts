import { useCallback, useEffect, useState } from 'react'
import { addRecord, deleteRecord, deleteRecordsBefore, getAllRecords } from '../lib/db'
import { getRetentionCutoff, isExpired } from '../lib/retention'
import { uid } from '../lib/uid'
import type { LocationRecord, NewLocation } from '../lib/types'

const byTimestampAsc = (a: LocationRecord, b: LocationRecord) =>
  a.timestamp.localeCompare(b.timestamp)

/**
 * Loads all location records into memory and exposes add/remove operations
 * that keep the IndexedDB store and the in-memory cache in sync.
 * `records` is `null` while the initial load is in flight.
 *
 * On load, records older than the 6-month retention window are pruned from
 * the store so history is kept exactly RETENTION_DAYS back.
 */
export function useLocationLogs() {
  const [records, setRecords] = useState<LocationRecord[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getAllRecords().then(async (stored) => {
      const cutoff = getRetentionCutoff()
      const expired = stored.filter((r) => isExpired(r.timestamp, cutoff))
      if (expired.length > 0) {
        await deleteRecordsBefore(cutoff.toISOString())
      }
      if (!cancelled) {
        setRecords(
          expired.length > 0 ? stored.filter((r) => !expired.includes(r)).sort(byTimestampAsc) : stored,
        )
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const add = useCallback(async (input: NewLocation): Promise<LocationRecord> => {
    const record: LocationRecord = {
      id: uid(),
      timestamp: new Date().toISOString(),
      lat: input.lat,
      lon: input.lon,
      description: input.description,
    }
    await addRecord(record)
    setRecords((prev) => (prev ? [...prev, record].sort(byTimestampAsc) : [record]))
    return record
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteRecord(id)
    setRecords((prev) => (prev ? prev.filter((r) => r.id !== id) : prev))
  }, [])

  return { records, add, remove }
}
