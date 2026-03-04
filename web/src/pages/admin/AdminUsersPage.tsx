import { useEffect, useMemo, useState } from 'react'
import AdminTable from '../../features/admin/components/AdminTable'
import DeleteConfirmModal from '../../features/admin/components/DeleteConfirmModal'
import type { AccountStatus, ManagedUser } from '../../features/admin/types'
import { adminService } from '../../services/adminService'
import AdminPageTemplate from './AdminPageTemplate'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<ManagedUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      const items = await adminService.listUsers({ search, status: status || undefined })
      setUsers(items)
      setIsLoading(false)
    }

    void loadUsers()
  }, [search, status])

  const handleDelete = async () => {
    if (!pendingDelete) {
      return
    }

    const current = pendingDelete
    const snapshot = users
    setIsDeleting(true)
    setUsers((prev) => prev.filter((user) => user.id !== current.id))

    try {
      await adminService.deleteUser(current.id)
      setPendingDelete(null)
    } catch {
      setUsers(snapshot)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      { key: 'id', header: 'ID', render: (user: ManagedUser) => <span className="font-medium">#{user.id}</span> },
      {
        key: 'name',
        header: 'User',
        render: (user: ManagedUser) => (
          <div>
            <p className="font-medium text-ink">{user.name}</p>
            <p className="text-xs text-ink/60">{user.email}</p>
          </div>
        ),
      },
      { key: 'status', header: 'Status', render: (user: ManagedUser) => user.status },
      { key: 'posts', header: 'Posts', render: (user: ManagedUser) => user.postsCount },
      { key: 'reports', header: 'Reports', render: (user: ManagedUser) => user.reportsCount },
      {
        key: 'joined',
        header: 'Joined',
        render: (user: ManagedUser) => new Date(user.joinedAt).toLocaleDateString(),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (user: ManagedUser) => (
          <button
            type="button"
            onClick={() => setPendingDelete(user)}
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
    <AdminPageTemplate title="Admin Users" description="View, search, and manage user accounts.">
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

      <AdminTable columns={columns} rows={users} rowKey={(user) => user.id} isLoading={isLoading} emptyMessage="No users found for the current filters." />

      <DeleteConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Delete user?"
        message={pendingDelete ? `Are you sure you want to delete ${pendingDelete.name}?` : ''}
        isProcessing={isDeleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </AdminPageTemplate>
  )
}
