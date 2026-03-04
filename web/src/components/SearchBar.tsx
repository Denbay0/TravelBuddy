import { Search } from 'lucide-react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Поиск' }: SearchBarProps) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-borderline/70 bg-surface px-4 py-3 transition focus-within:border-accent/70">
      <Search size={16} className="text-ink/45" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none"
      />
    </label>
  )
}
