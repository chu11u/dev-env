import type { LocationRecord } from './types'

const pad = (n: number): string => String(n).padStart(2, '0')

/** Local calendar date of `d` as a YYYY-MM-DD key (never UTC). */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Local midnight of a YYYY-MM-DD key. */
export function fromISODate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function todayKey(): string {
  return toISODate(new Date())
}

/** The last `n` local calendar day keys, newest first (index 0 = today). */
export function lastNDays(n: number): string[] {
  const now = new Date()
  const keys: string[] = []
  for (let i = 0; i < n; i += 1) {
    keys.push(toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)))
  }
  return keys
}

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** "14:30" — 24h local time for an ISO timestamp. */
export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

const dayLabelFormatter = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const fullDateFormatter = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/** Short chip label: "Today", "Yesterday", or "Mon, 11 Aug". */
export function formatDayLabel(key: string): string {
  if (key === todayKey()) return 'Today'
  const yesterday = fromISODate(todayKey())
  yesterday.setDate(yesterday.getDate() - 1)
  if (key === toISODate(yesterday)) return 'Yesterday'
  return dayLabelFormatter.format(fromISODate(key))
}

/** Long header label, e.g. "Monday, 11 August 2026". */
export function formatFullDate(key: string): string {
  return fullDateFormatter.format(fromISODate(key))
}

export interface DayGroup {
  date: string
  /** Items sorted chronologically (ascending). */
  items: LocationRecord[]
}

/** Groups records by local calendar day, days sorted newest first. */
export function groupByDate(records: readonly LocationRecord[]): DayGroup[] {
  const byDate = new Map<string, LocationRecord[]>()
  for (const record of records) {
    const key = toISODate(new Date(record.timestamp))
    const group = byDate.get(key)
    if (group) {
      group.push(record)
    } else {
      byDate.set(key, [record])
    }
  }

  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    }))
}
