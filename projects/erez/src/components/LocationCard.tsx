import { useEffect, useState } from 'react'
import { formatTime } from '../lib/dates'
import { pinUrl } from '../lib/route'
import type { LocationRecord } from '../lib/types'
import { ExternalIcon, TrashIcon } from './icons'

interface LocationCardProps {
  record: LocationRecord
  onDelete: (id: string) => void
}

export function LocationCard({ record, onDelete }: LocationCardProps) {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const timer = window.setTimeout(() => setConfirming(false), 3000)
    return () => window.clearTimeout(timer)
  }, [confirming])

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setConfirming(false)
    void onDelete(record.id)
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="w-14 shrink-0 text-center">
        <div className="text-lg font-bold tabular-nums leading-tight">{formatTime(record.timestamp)}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400">time</div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {record.description.trim() ? record.description : (
            <span className="italic text-slate-400 dark:text-slate-500">No description</span>
          )}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
          {record.lat.toFixed(6)}, {record.lon.toFixed(6)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <a
          href={pinUrl(record)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open pin in Google Maps"
          className="flex items-center gap-1.5 rounded-xl bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-600 transition-colors active:bg-sky-500/20 dark:text-sky-400"
        >
          <ExternalIcon className="h-4 w-4" />
          Pin
        </a>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={confirming ? 'Confirm delete' : 'Delete entry'}
          className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
            confirming
              ? 'bg-red-600 text-white active:bg-red-700'
              : 'text-slate-400 hover:text-red-600 active:bg-red-50 dark:hover:text-red-400 dark:active:bg-red-950'
          }`}
        >
          {confirming ? 'Confirm?' : <TrashIcon className="h-4 w-4" />}
        </button>
      </div>
    </li>
  )
}
