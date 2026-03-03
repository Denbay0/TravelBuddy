import { Search, UserCircle2 } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navLinks = [
  { to: '/routes', label: 'Маршруты' },
  { to: '/community', label: 'Сообщество' },
] as const

const DEFAULT_AVATAR_URL = '/media/avatars/default.svg'

export default function AppHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-sand/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          TravelBuddy
        </Link>

        <nav className="hidden gap-8 text-sm text-ink/70 md:flex">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `transition hover:text-ink ${isActive ? 'font-semibold text-ink' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <button aria-label="Поиск" className="rounded-full p-2 text-ink/80 transition hover:bg-white/70 hover:text-ink">
            <Search size={18} />
          </button>

          {user ? (
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-ink/80 transition hover:bg-white/70 hover:text-ink"
            >
              <img
                src={user.avatarUrl || DEFAULT_AVATAR_URL}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-ink/10 object-cover"
              />
              <span className="hidden leading-tight sm:inline">
                <span className="block text-xs font-semibold text-ink">{user.name}</span>
                <span className="block text-[11px] text-ink/65">@{user.handle}</span>
              </span>
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-ink/80 transition hover:bg-white/70 hover:text-ink"
            >
              <UserCircle2 size={18} />
              Войти
            </Link>
          )}

          <Link to="/routes" className="rounded-full bg-ink px-5 py-2.5 font-medium text-white transition hover:bg-ink/90">
            Создать маршрут
          </Link>
        </div>
      </div>
    </header>
  )
}
