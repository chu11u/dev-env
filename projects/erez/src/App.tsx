import { useState } from 'react'
import { LogView } from './components/LogView'
import { LogLocationModal } from './components/LogLocationModal'
import { ReportView } from './components/ReportView'
import { TabBar } from './components/TabBar'
import { useToast } from './hooks/useToast'
import { useGpsAcquisition } from './hooks/useGpsAcquisition'
import { useLocationLogs } from './hooks/useLocationLogs'
import type { NewLocation } from './lib/types'

export type Tab = 'log' | 'report'

export default function App() {
  const [tab, setTab] = useState<Tab>('log')
  const [logging, setLogging] = useState(false)
  const { records, add, remove } = useLocationLogs()
  const gps = useGpsAcquisition()
  const toast = useToast()

  const handleLogClick = () => {
    gps.start() // must run inside the user gesture for iOS permission prompts
    setLogging(true)
  }

  const handleSave = async (input: NewLocation): Promise<void> => {
    await add(input)
    toast.show('Location saved', 'success')
  }

  const handleDelete = async (id: string): Promise<void> => {
    await remove(id)
    toast.show('Entry deleted', 'success')
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            📍
          </span>
          <div>
            <h1 className="text-base font-semibold leading-tight">Location Log</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">GPS journal</p>
          </div>
        </div>
        {records !== null && (
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            {records.length} {records.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'log' ? (
          <LogView records={records} onLogClick={handleLogClick} onDelete={handleDelete} />
        ) : (
          <ReportView records={records} onDelete={handleDelete} />
        )}
      </main>

      <TabBar tab={tab} onChange={setTab} />

      {logging && (
        <LogLocationModal
          gpsState={gps.state}
          onRetry={gps.start}
          onClose={() => setLogging(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
