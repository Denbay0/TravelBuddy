import { useEffect, useMemo, useState } from 'react'
import type { DashboardMetrics, OnlineUsersBreakdown, RecentActivityItem } from '../../features/admin/types'
import MetricCard from '../../features/admin/components/MetricCard'
import { adminService } from '../../services/adminService'
import AdminPageTemplate from './AdminPageTemplate'

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [onlineBreakdown, setOnlineBreakdown] = useState<OnlineUsersBreakdown | null>(null)
  const [activity, setActivity] = useState<RecentActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      const [dashboardData, onlineData, activityData] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getOnlineUsersBreakdown(),
        adminService.getRecentActivity(),
      ])

      setMetrics(dashboardData)
      setOnlineBreakdown(onlineData)
      setActivity(activityData)
      setIsLoading(false)
    }

    void loadDashboard()
  }, [])

  const trendItems = useMemo(
    () => [
      { label: 'Posts trend', value: metrics?.postTrend ?? 0 },
      { label: 'Users trend', value: metrics?.userTrend ?? 0 },
      { label: 'Reports trend', value: metrics?.reportsTrend ?? 0 },
    ],
    [metrics],
  )

  return (
    <AdminPageTemplate title="Admin Dashboard" description="Overview metrics and operational insights for TravelBuddy.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending reports" value={metrics?.pendingReports ?? '...'} hint="Moderation queue" />
        <MetricCard label="Published posts" value={metrics?.publishedPosts ?? '...'} trend={metrics?.postTrend} />
        <MetricCard label="New users (7d)" value={metrics?.newUsersLast7Days ?? '...'} trend={metrics?.userTrend} />
        <MetricCard label="Active admins" value={metrics?.activeAdmins ?? '...'} hint="Online in the past 24h" />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">Lightweight trends</p>
          <div className="mt-4 space-y-3">
            {trendItems.map((item) => {
              const width = Math.min(100, Math.max(8, Math.abs(item.value) * 7))
              const barColor = item.value >= 0 ? 'bg-emerald-500/80' : 'bg-rose-500/80'

              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className={item.value >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {item.value >= 0 ? '+' : ''}
                      {item.value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10">
                    <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">Device breakdown</p>
          <p className="mt-2 text-2xl font-semibold">{onlineBreakdown?.totalOnline ?? '...'}</p>
          <div className="mt-4 space-y-2 text-sm">
            {[
              ['Web', onlineBreakdown?.web ?? 0],
              ['Mobile', onlineBreakdown?.mobile ?? 0],
              ['Admin panel', onlineBreakdown?.adminPanel ?? 0],
            ].map(([label, value]) => {
              const percentage = onlineBreakdown?.totalOnline ? (Number(value) / onlineBreakdown.totalOnline) * 100 : 0

              return (
                <div key={String(label)}>
                  <div className="mb-1 flex items-center justify-between">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10">
                    <div className="h-2 rounded-full bg-amber/70" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </div>

      <article className="mt-4 rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">Recent activity</p>
        {isLoading ? <p className="mt-2 text-sm text-ink/65">Loading activity...</p> : null}
        {!isLoading && !activity.length ? <p className="mt-2 text-sm text-ink/65">No recent activity yet.</p> : null}
        <ul className="mt-2 space-y-2 text-sm">
          {activity.map((item) => (
            <li key={item.id} className="text-ink/75">
              <span className="font-medium text-ink">{item.actor}</span> {item.action}{' '}
              <span className="font-medium">{item.target}</span>
            </li>
          ))}
        </ul>
      </article>
    </AdminPageTemplate>
  )
}
