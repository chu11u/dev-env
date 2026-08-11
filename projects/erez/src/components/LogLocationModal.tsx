import { useState } from 'react'
import type { GpsState } from '../hooks/useGpsAcquisition'
import type { NewLocation } from '../lib/types'
import { PinIcon, XIcon } from './icons'
import { Spinner } from './Spinner'
import { useToast } from '../hooks/useToast'

interface LogLocationModalProps {
  gpsState: GpsState
  onRetry: () => void
  onClose: () => void
  onSave: (input: NewLocation) => Promise<void>
}

export function LogLocationModal({ gpsState, onRetry, onClose, onSave }: LogLocationModalProps) {
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const acquired = gpsState.status === 'acquired'
  const canSave = acquired && !saving

  const handleSave = async () => {
    if (gpsState.status !== 'acquired') return
    setSaving(true)
    try {
      await onSave({
        lat: gpsState.lat,
        lon: gpsState.lon,
        description: description.trim(),
      })
      onClose()
    } catch {
      setSaving(false)
      toast.show('Could not save the location. Please try again.', 'error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        if (!saving) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log location"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-up flex max-h-[88dvh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Log Location</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your position is being captured in the background — add an optional note while it
              locks.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description (e.g. Client office, Parked car)"
          maxLength={200}
          enterKeyHint="done"
          autoFocus
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
        />

        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
            gpsState.status === 'error'
              ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
              : acquired
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
          aria-live="polite"
        >
          {gpsState.status === 'acquiring' && (
            <>
              <Spinner className="h-5 w-5 shrink-0" />
              <span>Getting a GPS fix…</span>
            </>
          )}

          {acquired && (
            <>
              <PinIcon className="h-5 w-5 shrink-0" />
              <span className="font-mono text-xs">
                {gpsState.lat.toFixed(6)}, {gpsState.lon.toFixed(6)}
                <span className="ml-2 font-sans opacity-70">±{Math.round(gpsState.accuracy)} m</span>
              </span>
            </>
          )}

          {gpsState.status === 'error' && (
            <>
              <span className="flex-1">{gpsState.message}</span>
              <button
                type="button"
                onClick={onRetry}
                className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white active:bg-red-700"
              >
                Retry
              </button>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3.5 text-base font-semibold text-slate-600 transition-colors active:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:active:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex flex-2 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition-colors active:bg-sky-600 disabled:opacity-40 disabled:shadow-none"
          >
            {saving && <Spinner className="h-5 w-5" />}
            Save Location
          </button>
        </div>
      </div>
    </div>
  )
}
