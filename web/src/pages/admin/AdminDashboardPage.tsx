import AdminPageTemplate from './AdminPageTemplate'

export default function AdminDashboardPage() {
  return (
    <AdminPageTemplate title="Admin Dashboard" description="Overview metrics and operational insights for TravelBuddy.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Pending reports', '18'],
          ['Published posts', '124'],
          ['New users (7d)', '56'],
          ['Active admins', '6'],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </article>
        ))}
      </div>
    </AdminPageTemplate>
  )
}
