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
              ? 'border-ink bg-ink text-white'
              : 'border-ink/15 bg-white text-ink/75 hover:border-ink/35',
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
