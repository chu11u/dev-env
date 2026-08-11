import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { LocationRecord } from './types'

const DB_NAME = 'location-log'
const DB_VERSION = 1
const STORE = 'locations'

interface LocationLogDB extends DBSchema {
  locations: {
    key: string
    value: LocationRecord
    indexes: { 'by-timestamp': string }
  }
}

let dbPromise: Promise<IDBPDatabase<LocationLogDB>> | null = null

function getDB(): Promise<IDBPDatabase<LocationLogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LocationLogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('by-timestamp', 'timestamp')
      },
    })
  }
  return dbPromise
}

export async function addRecord(record: LocationRecord): Promise<void> {
  const db = await getDB()
  await db.put(STORE, record)
}

export async function getAllRecords(): Promise<LocationRecord[]> {
  const db = await getDB()
  return db.getAll(STORE)
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
}

/**
 * Removes every record with a timestamp <= the given ISO string, using the
 * by-timestamp index. Used to enforce the retention window.
 */
export async function deleteRecordsBefore(timestamp: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE, 'readwrite')
  const index = tx.objectStore(STORE).index('by-timestamp')
  let cursor = await index.openCursor(IDBKeyRange.upperBound(timestamp))
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}
