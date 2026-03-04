import { useEffect, useMemo, useState } from 'react'
import AdminTable from '../../features/admin/components/AdminTable'
import CreateAdminModal from '../../features/admin/components/CreateAdminModal'
import DeleteConfirmModal from '../../features/admin/components/DeleteConfirmModal'
import type { AccountStatus, AdminRole, AdminUser } from '../../features/admin/types'
import { adminService } from '../../services/adminService'
import AdminPageTemplate from './AdminPageTemplate'

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [role, setRole] = useState<AdminRole | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadAdmins = async () => {
      setIsLoading(true)
      const items = await adminService.listAdmins({ search, status: status || undefined, role: role || undefined })
      setAdmins(items)
      setIsLoading(false)
    }

    void loadAdmins()
  }, [search, status, role])

  const handleDelete = async () => {
    if (!pendingDelete) {
      return
    }

    const current = pendingDelete
    const snapshot = admins
    setIsDeleting(true)
    setAdmins((prev) => prev.filter((admin) => admin.id !== current.id))

    try {
      await adminService.deleteAdmin(current.id)
      setPendingDelete(null)
    } catch {
      setAdmins(snapshot)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreate = async (payload: Omit<AdminUser, 'id' | 'createdAt' | 'lastActiveAt'>) => {
    const optimisticAdmin: AdminUser = {
      id: -Date.now(),
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      ...payload,
    }

    setIsCreating(true)
    setAdmins((prev) => [optimisticAdmin, ...prev])

    try {
      const created = await adminService.createAdmin(payload)
      setAdmins((prev) => prev.map((admin) => (admin.id === optimisticAdmin.id ? created : admin)))
      setIsCreateOpen(false)
    } catch {
      setAdmins((prev) => prev.filter((admin) => admin.id !== optimisticAdmin.id))
    } finally {
      setIsCreating(false)
    }
  }

  const columns = useMemo(
    () => [
      { key: 'id', header: 'ID', render: (admin: AdminUser) => <span className="font-medium">#{admin.id}</span> },
      {
        key: 'name',
        header: 'Admin',
        render: (admin: AdminUser) => (
          <div>
            <p className="font-medium text-ink">{admin.name}</p>
            <p className="text-xs text-ink/60">{admin.email}</p>
          </div>
        ),
      },
      { key: 'role', header: 'Role', render: (admin: AdminUser) => admin.role },
      { key: 'status', header: 'Status', render: (admin: AdminUser) => admin.status },
      {
        key: 'lastActive',
        header: 'Last active',
        render: (admin: AdminUser) => new Date(admin.lastActiveAt).toLocaleDateString(),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (admin: AdminUser) => (
          <button
            type="button"
            onClick={() => setPendingDelete(admin)}
            className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600"
          >
            Delete
          </button>
        ),
      },
    ],
    [],
  )

  return (
    <AdminPageTemplate
      title="Admin Admins"
      description="Manage administrator permissions and access controls."
      action={
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
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

      <AdminTable
        columns={columns}
        rows={admins}
        rowKey={(admin) => admin.id}
        isLoading={isLoading}
        emptyMessage="No admins found for the current filters."
      />

      <CreateAdminModal
        isOpen={isCreateOpen}
        isSubmitting={isCreating}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(payload) => void handleCreate(payload)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Delete admin?"
        message={pendingDelete ? `Remove admin access for ${pendingDelete.name}?` : ''}
        isProcessing={isDeleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </AdminPageTemplate>
  )
}
