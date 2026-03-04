type DeleteConfirmModalProps = {
  isOpen: boolean
  title?: string
  message?: string
  confirmLabel?: string
  isProcessing?: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  title = 'Delete item?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  isProcessing = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] bg-ink/40 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto max-w-md rounded-2xl border border-white/80 bg-[#faf7f2] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink/70">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg border border-rose-300 bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isProcessing}
          >
            {isProcessing ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
