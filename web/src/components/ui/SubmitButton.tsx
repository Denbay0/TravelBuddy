type SubmitButtonProps = {
  text: string
  loadingText: string
  isSubmitting: boolean
}

export function SubmitButton({ text, loadingText, isSubmitting }: SubmitButtonProps) {
  return (
    <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex w-full rounded-2xl py-3">
      {isSubmitting ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[rgb(var(--button-primary-text))/0.7] border-t-transparent" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  )
}
