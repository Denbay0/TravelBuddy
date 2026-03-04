import AdminPageTemplate from './AdminPageTemplate'

export default function AdminPostsPage() {
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
    />
  )
}
