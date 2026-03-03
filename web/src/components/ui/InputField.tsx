import { clsx } from 'clsx'

type InputFieldProps = {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete?: string
}

export function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}: InputFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-ink/90">{label}</span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={clsx(
          'w-full rounded-2xl border bg-white/95 px-4 py-3 text-sm text-ink outline-none transition',
          'placeholder:text-ink/40 focus:ring-2 focus:ring-amber/35',
          error ? 'border-red-400 focus:border-red-400' : 'border-ink/15 focus:border-amber/60',
        )}
      />
      {error ? <span className="mt-2 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
