import { describe, expect, it } from 'vitest'
import { RETENTION_DAYS, getRetentionCutoff, isExpired } from './retention'

const DAY_MS = 86_400_000

describe('retention', () => {
  it('cutoff is exactly RETENTION_DAYS before the reference time', () => {
    const now = new Date('2026-08-11T12:00:00.000Z')
    const cutoff = getRetentionCutoff(now)
    expect(now.getTime() - cutoff.getTime()).toBe(RETENTION_DAYS * DAY_MS)
  })

  it('expires records strictly older than the cutoff, keeps the cutoff itself', () => {
    const now = new Date('2026-08-11T12:00:00.000Z')
    const cutoff = getRetentionCutoff(now)
    expect(isExpired(new Date(cutoff.getTime() - 1).toISOString(), cutoff)).toBe(true)
    expect(isExpired(cutoff.toISOString(), cutoff)).toBe(false)
    expect(isExpired(new Date(cutoff.getTime() + DAY_MS).toISOString(), cutoff)).toBe(false)
  })
})
