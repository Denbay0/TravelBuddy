type MetricCardProps = {
  label: string
  value: number | string
  trend?: number
  hint?: string
}

export default function MetricCard({ label, value, trend, hint }: MetricCardProps) {
  const trendColor = typeof trend === 'number' ? (trend >= 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-ink/50'

  return (
    <article className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {typeof trend === 'number' ? (
        <p className={`mt-2 text-sm font-medium ${trendColor}`}>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</p>
      ) : null}
      {hint ? <p className="mt-1 text-xs text-ink/55">{hint}</p> : null}
    </article>
  )
}
