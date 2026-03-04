import { useEffect, useState } from 'react'
import type { AccountStatus, AdminRole, AdminUser } from '../../features/admin/types'
import { adminService } from '../../services/adminService'
import AdminPageTemplate from './AdminPageTemplate'

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [role, setRole] = useState<AdminRole | ''>('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void adminService.listAdmins({ search, status: status || undefined, role: role || undefined }).then(setAdmins)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [search, status, role])

  const refreshAdmins = async () => {
    const items = await adminService.listAdmins({ search, status: status || undefined, role: role || undefined })
    setAdmins(items)
  }

  const handleDelete = async (adminId: number) => {
    await adminService.deleteAdmin(adminId)
    await refreshAdmins()
  }

  const handleCreate = async () => {
    await adminService.createAdmin({
      name: 'New Admin',
      email: `new.admin.${Date.now()}@travelbuddy.dev`,
      role: 'moderator',
      status: 'active',
    })
    await refreshAdmins()
  }

  return (
    <AdminPageTemplate
      title="Admin Admins"
      description="Manage administrator permissions and access controls."
      action={
        <button
          type="button"
          onClick={() => void handleCreate()}
          className="rounded-xl border border-amber/20 bg-amber/15 px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-amber/25"
        >
          Create admin
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search admins"
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
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as AdminRole | '')}
          className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          <option value="super_admin">Super admin</option>
          <option value="moderator">Moderator</option>
          <option value="support">Support</option>
        </select>
      </div>

      <div className="space-y-2">
        {admins.map((admin) => (
          <article key={admin.id} className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{admin.name}</h3>
                <p className="text-sm text-ink/60">
                  {admin.email} · {admin.role} · {admin.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(admin.id)}
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
