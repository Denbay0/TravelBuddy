import { useEffect, useState } from 'react'
import type { AccountStatus, ManagedUser } from '../../features/admin/types'
import { adminService } from '../../services/adminService'
import AdminPageTemplate from './AdminPageTemplate'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void adminService.listUsers({ search, status: status || undefined }).then(setUsers)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [search, status])

  const handleDelete = async (userId: number) => {
    await adminService.deleteUser(userId)
    const items = await adminService.listUsers({ search, status: status || undefined })
    setUsers(items)
  }

  return (
    <AdminPageTemplate title="Admin Users" description="Manage user accounts, roles, and support-related actions.">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users"
          className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as AccountStatus | '')}
          className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <article key={user.id} className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-ink/60">
                  {user.email} · {user.status} · {user.postsCount} posts · {user.reportsCount} reports
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(user.id)}
                className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </AdminPageTemplate>
  )
}
