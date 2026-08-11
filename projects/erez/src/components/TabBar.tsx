import type { Tab } from '../App'
import { ListIcon, PinIcon } from './icons'

interface TabBarProps {
  tab: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: typeof PinIcon }[] = [
  { id: 'log', label: 'Log', icon: PinIcon },
  { id: 'report', label: 'Report', icon: ListIcon },
]

export function TabBar({ tab, onChange }: TabBarProps) {
  return (
    <nav className="border-t border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="grid grid-cols-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-500 active:text-slate-700 dark:text-slate-400 dark:active:text-slate-200'
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
