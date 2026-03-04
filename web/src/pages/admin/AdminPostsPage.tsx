import { useEffect, useState } from 'react'
import type { ManagedPost, PostStatus } from '../../features/admin/types'
import { adminService } from '../../services/adminService'
import AdminPageTemplate from './AdminPageTemplate'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<ManagedPost[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PostStatus | ''>('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void adminService.listPosts({ search, status: status || undefined }).then(setPosts)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [search, status])

  const handleDelete = async (postId: number) => {
    await adminService.deletePost(postId)
    const items = await adminService.listPosts({ search, status: status || undefined })
    setPosts(items)
  }

  return (
    <AdminPageTemplate
      title="Admin Posts"
      description="Create, edit, and curate editorial content for the platform."
      action={
        <button
          type="button"
          className="rounded-xl border border-amber/20 bg-amber/15 px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-amber/25"
        >
          New post
        </button>
      }
    >
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

      <div className="space-y-2">
        {posts.map((post) => (
          <article key={post.id} className="rounded-xl border border-ink/10 bg-white/65 p-4 shadow-sm dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-sm text-ink/60">
                  {post.authorName} · {post.status} · {post.likesCount} likes · {post.reportsCount} reports
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(post.id)}
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
