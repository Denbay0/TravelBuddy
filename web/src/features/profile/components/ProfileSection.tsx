import type { PropsWithChildren, ReactNode } from 'react'

type ProfileSectionProps = PropsWithChildren<{
  title: string
  subtitle?: string
  action?: ReactNode
}>

export function ProfileSection({ title, subtitle, action, children }: ProfileSectionProps) {
  return (
    <section className="card-surface p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-ink/60">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
