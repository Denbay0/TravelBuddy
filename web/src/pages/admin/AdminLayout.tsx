import { Link, Outlet } from 'react-router-dom'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/admins', label: 'Admins' },
  { to: '/admin/login', label: 'Login' },
]

export default function AdminLayout() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        {adminLinks.map((link) => (
          <Link key={link.to} to={link.to} className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:border-ink/50">
            {link.label}
          </Link>
        ))}
      </div>
      <Outlet />
    </main>
  )
}
