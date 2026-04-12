
interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 border border-stone-200">
        <h3 className="text-base font-medium text-[#1a1a18] mb-1">
          {title}
        </h3>
        <p className="text-sm text-stone-400 mb-6">
          {description}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-stone-500 hover:text-[#1a1a18] border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#1a1a18] hover:bg-stone-800 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog