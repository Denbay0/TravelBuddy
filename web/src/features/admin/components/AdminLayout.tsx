import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar, { type AdminNavLink } from './AdminSidebar'

const adminLinks: AdminNavLink[] = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/admins', label: 'Admins' },
]

export default function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid min-h-[calc(100vh-3rem)] gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="card-surface hidden h-fit p-4 lg:sticky lg:top-6 lg:block">
          <AdminSidebar links={adminLinks} />
        </aside>

        <section className="card-surface min-h-[70vh] p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-ink/10 pb-3 lg:hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/50">Admin</p>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen((current) => !current)}
              className="rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-ink/30 dark:bg-white/10"
              aria-expanded={isMobileSidebarOpen}
              aria-controls="mobile-admin-sidebar"
            >
              Menu
            </button>
          </div>

          {isMobileSidebarOpen ? (
            <div id="mobile-admin-sidebar" className="mb-4 rounded-2xl border border-ink/10 bg-white/60 p-3 shadow-sm lg:hidden dark:bg-white/5">
              <AdminSidebar links={adminLinks} onNavigate={() => setIsMobileSidebarOpen(false)} />
            </div>
          ) : null}

          <Outlet />
        </section>
      </div>
    </main>
  )
}
