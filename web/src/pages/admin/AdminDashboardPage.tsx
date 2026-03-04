import { useEffect, useState } from 'react'
import type { DashboardMetrics, OnlineUsersBreakdown, RecentActivityItem } from '../../features/admin/types'
import { adminService } from '../../services/adminService'
import AdminPageTemplate from './AdminPageTemplate'

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [onlineBreakdown, setOnlineBreakdown] = useState<OnlineUsersBreakdown | null>(null)
  const [activity, setActivity] = useState<RecentActivityItem[]>([])

  useEffect(() => {
    const loadDashboard = async () => {
      const [dashboardData, onlineData, activityData] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getOnlineUsersBreakdown(),
        adminService.getRecentActivity(),
      ])

      setMetrics(dashboardData)
      setOnlineBreakdown(onlineData)
      setActivity(activityData)
    }

    void loadDashboard()
  }, [])

  return (
    <AdminPageTemplate title="Admin Dashboard" description="Overview metrics and operational insights for TravelBuddy.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Pending reports', metrics?.pendingReports],
          ['Published posts', metrics?.publishedPosts],
          ['New users (7d)', metrics?.newUsersLast7Days],
          ['Active admins', metrics?.activeAdmins],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value ?? '...'}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">Online users breakdown</p>
          <p className="mt-2 text-2xl font-semibold">{onlineBreakdown?.totalOnline ?? '...'}</p>
          <p className="mt-1 text-sm text-ink/60">
            Web: {onlineBreakdown?.web ?? '...'} · Mobile: {onlineBreakdown?.mobile ?? '...'} · Admin:{' '}
            {onlineBreakdown?.adminPanel ?? '...'}
          </p>
        </article>

        <article className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">Recent activity</p>
          <ul className="mt-2 space-y-2 text-sm">
            {activity.map((item) => (
              <li key={item.id} className="text-ink/75">
                <span className="font-medium text-ink">{item.actor}</span> {item.action} <span className="font-medium">{item.target}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </AdminPageTemplate>
  )
}
