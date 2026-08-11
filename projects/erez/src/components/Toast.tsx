import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastVariant } from '../hooks/useToast'
import { CheckIcon, XIcon } from './icons'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

const TOAST_DURATION_MS = 3200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = nextId.current + 1
      nextId.current = id
      setToasts((prev) => [...prev, { id, message, variant }])
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-60 flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-toast-in flex w-full max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.variant === 'success'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.variant === 'success' ? (
              <CheckIcon className="h-4 w-4 shrink-0 text-emerald-400 dark:text-emerald-500" />
            ) : (
              <XIcon className="h-4 w-4 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
