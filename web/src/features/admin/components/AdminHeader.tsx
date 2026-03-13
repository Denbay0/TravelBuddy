import type { ReactNode } from 'react'

type AdminHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  const normalizedTitle = title.replace(/^admin\s+/i, '')

  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 pb-4 md:gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] md:text-3xl">{normalizedTitle}</h1>
        {subtitle ? <p className="mt-2 text-sm leading-relaxed text-ink/65 [overflow-wrap:anywhere] md:text-base">{subtitle}</p> : null}
      </div>
      {action ? <div className="w-full min-w-0 sm:w-auto sm:shrink-0">{action}</div> : null}
    </header>
  )
}
