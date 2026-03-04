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
        className={clsx('form-control', error ? 'border-red-400 focus:border-red-400 focus:ring-red-300/40' : '')}
      />
      {error ? <span className="mt-2 block text-xs text-red-500">{error}</span> : null}
    </label>
  )
}
