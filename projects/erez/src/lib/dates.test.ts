import { describe, expect, it } from 'vitest'
import { formatDayLabel, formatTime, fromISODate, groupByDate, lastNDays, todayKey, toISODate } from './dates'
import type { LocationRecord } from './types'

function record(iso: string): LocationRecord {
  return { id: iso, timestamp: iso, lat: 0, lon: 0, description: '' }
}

describe('toISODate', () => {
  it('uses the LOCAL calendar date, not UTC', () => {
    // 23:30 local on 11 August
    const d = new Date(2026, 7, 11, 23, 30)
    expect(toISODate(d)).toBe('2026-08-11')
  })

  it('pads months and days', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('fromISODate', () => {
  it('round-trips to local midnight', () => {
    const d = fromISODate('2026-08-11')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(7)
    expect(d.getDate()).toBe(11)
    expect(d.getHours()).toBe(0)
  })
})

describe('formatTime', () => {
  it('formats as 24h HH:mm', () => {
    expect(formatTime(new Date(2026, 7, 11, 14, 30).toISOString())).toBe('14:30')
    expect(formatTime(new Date(2026, 7, 11, 9, 5).toISOString())).toBe('09:05')
    expect(formatTime(new Date(2026, 7, 11, 0, 0).toISOString())).toBe('00:00')
  })
})

describe('lastNDays', () => {
  it('returns today first, newest to oldest', () => {
    const days = lastNDays(7)
    expect(days).toHaveLength(7)
    expect(days[0]).toBe(todayKey())
    // consecutive days differ by exactly one
    for (let i = 1; i < days.length; i += 1) {
      const diff = fromISODate(days[i - 1]).getTime() - fromISODate(days[i]).getTime()
      expect(diff).toBe(86_400_000)
    }
  })
})

describe('formatDayLabel', () => {
  it('labels today and yesterday', () => {
    expect(formatDayLabel(todayKey())).toBe('Today')
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatDayLabel(toISODate(yesterday))).toBe('Yesterday')
  })

  it('falls back to a short date for older days', () => {
    expect(formatDayLabel('2020-01-02')).toMatch(/^[A-Z][a-z]{2}, .*/)
  })
})

describe('groupByDate', () => {
  it('groups records by local day, newest day first, chronological within day', () => {
    // timestamps are built from LOCAL dates so bucketing is timezone-independent
    const local = (y: number, m: number, d: number, h: number) =>
      new Date(y, m, d, h).toISOString()
    const records = [
      record(local(2026, 7, 10, 9)),
      record(local(2026, 7, 11, 9)),
      record(local(2026, 7, 11, 7)),
      record(local(2026, 7, 12, 9)),
    ]
    const groups = groupByDate(records)
    expect(groups.map((g) => g.date)).toEqual(['2026-08-12', '2026-08-11', '2026-08-10'])
    expect(groups[1].items.map((r) => new Date(r.timestamp).getHours())).toEqual([7, 9])
  })
})
