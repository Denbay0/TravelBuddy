import type { ReactNode } from 'react'

type AdminHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-ink/65 md:text-base">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
