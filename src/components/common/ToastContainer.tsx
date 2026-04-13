import type { Toast, ToastType } from '../../hooks/useToast'

interface ToastContainerProps {
  toasts:  Toast[]
  onClose: (id: string) => void
}

const STYLES: Record<ToastType, string> = {
  success: 'bg-white border-green-100 text-green-700',
  error:   'bg-white border-red-100 text-red-600',
  warning: 'bg-white border-amber-100 text-amber-600',
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  warning: '!',
}

const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm max-w-sm animate-in slide-in-from-right ${
            STYLES[t.type]
          }`}
        >
          <span className="shrink-0 font-medium">{ICONS[t.type]}</span>
          <p className="flex-1">{t.message}</p>
          <button
            onClick={() => onClose(t.id)}
            className="text-stone-300 hover:text-stone-500 transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer