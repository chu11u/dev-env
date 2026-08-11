import { useState } from 'react'
import { copyText } from '../lib/clipboard'
import { formatTime } from '../lib/dates'
import { MAX_ROUTE_POINTS, routeUrl } from '../lib/route'
import type { LocationRecord } from '../lib/types'
import { CheckIcon, CopyIcon, ExternalIcon, RouteIcon, XIcon } from './icons'
import { useToast } from '../hooks/useToast'

interface RouteSheetProps {
  /** Chronologically ordered points for the selected day. */
  points: LocationRecord[]
  onClose: () => void
}

export function RouteSheet({ points, onClose }: RouteSheetProps) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  const route = routeUrl(points)

  const handleCopy = async () => {
    const ok = await copyText(route.url)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
      toast.show('Route link copied', 'success')
    } else {
      toast.show('Could not copy the link. Open it in Maps instead.', 'error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Route link"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-up flex w-full max-w-lg flex-col gap-4 rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <RouteIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Route Link</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {route.total} {route.total === 1 ? 'stop' : 'stops'}
                {route.downsampled
                  ? ` — showing ${route.included} of ${route.total} (Google Maps limit is ${MAX_ROUTE_POINTS})`
                  : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex gap-2.5">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
            <p className="truncate">
              <span className="font-semibold">Start</span>
              <span className="ml-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                {formatTime(route.origin.timestamp)} · {route.origin.lat.toFixed(5)},{' '}
                {route.origin.lon.toFixed(5)}
              </span>
            </p>
          </div>
          {route.waypoints.length > 0 && (
            <div className="my-1.5 ml-0.75 border-l-2 border-dashed border-slate-300 dark:border-slate-600">
              {route.waypoints.map((w) => (
                <p key={w.id} className="ml-3 flex gap-2.5 py-1">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-400" aria-hidden="true" />
                  <span className="truncate">
                    <span className="font-semibold">Stop</span>
                    <span className="ml-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {formatTime(w.timestamp)} · {w.lat.toFixed(5)}, {w.lon.toFixed(5)}
                    </span>
                  </span>
                </p>
              ))}
            </div>
          )}
          <div className="mt-1.5 flex gap-2.5">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-hidden="true" />
            <p className="truncate">
              <span className="font-semibold">End</span>
              <span className="ml-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                {formatTime(route.destination.timestamp)} · {route.destination.lat.toFixed(5)},{' '}
                {route.destination.lon.toFixed(5)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3.5 text-base font-semibold text-slate-700 transition-colors active:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:active:bg-slate-800"
          >
            {copied ? <CheckIcon className="h-5 w-5 text-emerald-500" /> : <CopyIcon className="h-5 w-5" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <a
            href={route.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors active:bg-emerald-600"
          >
            <ExternalIcon className="h-5 w-5" />
            Open in Maps
          </a>
        </div>
      </div>
    </div>
  )
}
