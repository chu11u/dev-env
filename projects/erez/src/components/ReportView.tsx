import { useMemo, useState } from 'react'
import { formatDayLabel, formatFullDate, groupByDate, lastNDays, toISODate, todayKey } from '../lib/dates'
import { getRetentionCutoff } from '../lib/retention'
import type { LocationRecord } from '../lib/types'
import { LocationCard } from './LocationCard'
import { RouteIcon } from './icons'
import { RouteSheet } from './RouteSheet'
import { Spinner } from './Spinner'

interface ReportViewProps {
  records: LocationRecord[] | null
  onDelete: (id: string) => void
}

export function ReportView({ records, onDelete }: ReportViewProps) {
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [routeOpen, setRouteOpen] = useState(false)

  const groups = useMemo(() => groupByDate(records ?? []), [records])
  const dayItems = groups.find((g) => g.date === selectedDate)?.items ?? []
  const dayKeys = useMemo(() => lastNDays(7), [])
  const today = todayKey()
  const minDate = useMemo(() => toISODate(getRetentionCutoff()), [])

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-8 pt-5">
      <div className="flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Daily Report
        </h2>
        <label className="sr-only" htmlFor="date-picker">
          Pick a date
        </label>
        <input
          id="date-picker"
          type="date"
          value={selectedDate}
          min={minDate}
          max={today}
          onChange={(e) => {
            if (e.target.value) setSelectedDate(e.target.value)
          }}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dayKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedDate(key)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
              key === selectedDate
                ? 'bg-sky-500 text-white'
                : 'bg-white text-slate-600 active:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:active:bg-slate-800'
            }`}
          >
            {formatDayLabel(key)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{formatFullDate(selectedDate)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {records === null
              ? 'Loading…'
              : `${dayItems.length} ${dayItems.length === 1 ? 'location' : 'locations'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRouteOpen(true)}
          disabled={dayItems.length < 2}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors active:bg-emerald-600 disabled:opacity-40 disabled:shadow-none"
        >
          <RouteIcon className="h-4 w-4" />
          Route
        </button>
      </div>

      {records === null ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 dark:text-slate-400">
          <Spinner className="h-5 w-5" /> Loading your journal…
        </div>
      ) : dayItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          No locations logged on this day.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {dayItems.map((record) => (
            <LocationCard key={record.id} record={record} onDelete={onDelete} />
          ))}
        </ul>
      )}

      {routeOpen && dayItems.length >= 2 && (
        <RouteSheet points={dayItems} onClose={() => setRouteOpen(false)} />
      )}

      <p className="px-1 pt-2 text-center text-xs text-slate-400 dark:text-slate-500">
        History is kept for the last 6 months.
      </p>
    </div>
  )
}
