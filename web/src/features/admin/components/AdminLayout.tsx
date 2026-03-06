import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAdminAuth } from '../auth/useAdminAuth'
import AdminSidebar, { type AdminNavLink } from './AdminSidebar'

const adminLinks: AdminNavLink[] = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/admins', label: 'Admins' },
]

export default function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { admin, logout } = useAdminAuth()

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid min-h-[calc(100vh-3rem)] gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="card-surface hidden h-fit p-4 lg:sticky lg:top-6 lg:block">
          <AdminSidebar links={adminLinks} />
        </aside>

        <section className="card-surface min-h-[70vh] p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
            <p className="min-w-0 text-sm font-semibold text-ink/70 [overflow-wrap:anywhere]">{admin?.name}</p>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen((current) => !current)}
                className="rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-ink/30 dark:bg-white/10 lg:hidden"
                aria-expanded={isMobileSidebarOpen}
                aria-controls="mobile-admin-sidebar"
              >
                Menu
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-ink/20 px-3 py-2 text-xs font-medium text-ink/80 transition hover:bg-ink/5"
              >
                Выйти
              </button>
            </div>
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
