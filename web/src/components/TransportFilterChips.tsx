import clsx from 'clsx'

type TransportFilterChipsProps<T extends string> = {
  items: readonly T[]
  active: T
  onChange: (value: T) => void
}

export default function TransportFilterChips<T extends string>({
  items,
  active,
  onChange,
}: TransportFilterChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={clsx(
            'rounded-full border px-4 py-2 text-sm transition',
            active === item
              ? 'border-accent bg-accent text-[rgb(var(--text-on-accent))]'
              : 'border-borderline/70 bg-surface text-ink/80 hover:border-accent/60',
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
