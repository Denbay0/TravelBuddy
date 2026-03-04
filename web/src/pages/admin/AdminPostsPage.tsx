import { useEffect, useMemo, useState } from 'react'
import AdminTable from '../../features/admin/components/AdminTable'
import DeleteConfirmModal from '../../features/admin/components/DeleteConfirmModal'
import type { ManagedPost, PostStatus } from '../../features/admin/types'
import { adminService } from '../../services/adminService'
import AdminPageTemplate from './AdminPageTemplate'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<ManagedPost[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PostStatus | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<ManagedPost | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true)
      const items = await adminService.listPosts({ search, status: status || undefined })
      setPosts(items)
      setIsLoading(false)
    }

    void loadPosts()
  }, [search, status])

  const handleDelete = async () => {
    if (!pendingDelete) {
      return
    }

    const current = pendingDelete
    const snapshot = posts
    setIsDeleting(true)
    setPosts((prev) => prev.filter((post) => post.id !== current.id))

    try {
      await adminService.deletePost(current.id)
      setPendingDelete(null)
    } catch {
      setPosts(snapshot)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = useMemo(
    () => [
      { key: 'id', header: 'ID', render: (post: ManagedPost) => <span className="font-medium">#{post.id}</span> },
      {
        key: 'title',
        header: 'Title',
        render: (post: ManagedPost) => (
          <div>
            <p className="font-medium text-ink">{post.title}</p>
            <p className="text-xs text-ink/60">Author: {post.authorName}</p>
          </div>
        ),
      },
      { key: 'status', header: 'Status', render: (post: ManagedPost) => post.status },
      { key: 'likes', header: 'Likes', render: (post: ManagedPost) => post.likesCount },
      { key: 'reports', header: 'Reports', render: (post: ManagedPost) => post.reportsCount },
      {
        key: 'created',
        header: 'Created',
        render: (post: ManagedPost) => new Date(post.createdAt).toLocaleDateString(),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (post: ManagedPost) => (
          <button
            type="button"
            onClick={() => setPendingDelete(post)}
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
    <AdminPageTemplate title="Admin Posts" description="Search and moderate community content from one place.">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search posts"
          className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as PostStatus | '')}
          className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <AdminTable columns={columns} rows={posts} rowKey={(post) => post.id} isLoading={isLoading} emptyMessage="No posts found for the current filters." />

      <DeleteConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Delete post?"
        message={pendingDelete ? `Are you sure you want to delete “${pendingDelete.title}”?` : ''}
        isProcessing={isDeleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </AdminPageTemplate>
  )
}
