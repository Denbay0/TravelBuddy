import type { ReactNode } from 'react'

type AuthCardProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="card-surface w-full max-w-md p-8 sm:p-10">
      <h1 className="text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 text-sm text-ink/70">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  )
}
