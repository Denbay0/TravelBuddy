type SubmitButtonProps = {
  text: string
  loadingText: string
  isSubmitting: boolean
}

export function SubmitButton({ text, loadingText, isSubmitting }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/55"
    >
      {isSubmitting ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  )
}
