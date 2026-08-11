/** Location history is kept for the last 6 months; older records are pruned. */
export const RETENTION_DAYS = 182

const DAY_MS = 86_400_000

/** Records older than this timestamp are eligible for pruning. */
export function getRetentionCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - RETENTION_DAYS * DAY_MS)
}

/** True when a record's ISO timestamp falls outside the retention window. */
export function isExpired(timestamp: string, cutoff: Date = getRetentionCutoff()): boolean {
  return new Date(timestamp).getTime() < cutoff.getTime()
}
