import { NavLink } from 'react-router-dom'

export type AdminNavLink = {
  to: string
  label: string
}

type AdminSidebarProps = {
  links: AdminNavLink[]
  onNavigate?: () => void
  className?: string
}

const baseNavLinkClass =
  'block w-full rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-ink/70 transition hover:border-ink/10 hover:bg-white/60 hover:text-ink dark:hover:bg-white/10'

export default function AdminSidebar({ links, onNavigate, className = '' }: AdminSidebarProps) {
  return (
    <nav className={className} aria-label="Admin navigation">
      <div className="mb-6 px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">Admin panel</p>
      </div>
      <div className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive
                ? 'block w-full rounded-xl border border-amber/20 bg-amber/10 px-3 py-2 text-sm font-semibold text-ink shadow-sm'
                : baseNavLinkClass
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
