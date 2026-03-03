import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  description?: string
  badge?: string
  action?: ReactNode
}

export default function SectionHeader({ title, description, badge, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {badge ? <p className="text-xs uppercase tracking-[0.14em] text-ink/45">{badge}</p> : null}
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink/70 md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
