import { PinIcon } from './icons'
import { LocationCard } from './LocationCard'
import { Spinner } from './Spinner'
import { todayKey, toISODate } from '../lib/dates'
import type { LocationRecord } from '../lib/types'

interface LogViewProps {
  records: LocationRecord[] | null
  onLogClick: () => void
  onDelete: (id: string) => void
}

export function LogView({ records, onLogClick, onDelete }: LogViewProps) {
  const today = todayKey()
  const todays = records?.filter((r) => toISODate(new Date(r.timestamp)) === today) ?? []
  const recent = records ? [...records].reverse().slice(0, 5) : []

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-8 pt-8">
      <section className="flex flex-col items-center gap-4 text-center">
        <button
          type="button"
          onClick={onLogClick}
          className="flex h-36 w-36 flex-col items-center justify-center gap-2 rounded-full bg-sky-500 text-white shadow-xl shadow-sky-500/30 transition-transform active:scale-95"
          aria-label="Log current location"
        >
          <PinIcon className="h-12 w-12" />
          <span className="text-base font-semibold">Log Location</span>
        </button>

        {records === null ? (
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Spinner className="h-4 w-4" /> Loading your journal…
          </p>
        ) : records.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No locations logged yet. Tap the button to record where you are.
          </p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{todays.length}</span>{' '}
            {todays.length === 1 ? 'location' : 'locations'} today ·{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{records.length}</span>{' '}
            total
          </p>
        )}
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Recent
          </h2>
          <ul className="flex flex-col gap-2">
            {recent.map((record) => (
              <LocationCard key={record.id} record={record} onDelete={onDelete} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
