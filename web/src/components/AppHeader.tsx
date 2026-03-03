import { Search, UserCircle2 } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/routes', label: 'Маршруты' },
  { to: '/community', label: 'Сообщество' },
] as const

export default function AppHeader() {
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
          <button className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-ink/80 transition hover:bg-white/70 hover:text-ink">
            <UserCircle2 size={18} />
            Войти
          </button>
          <button className="rounded-full bg-ink px-5 py-2.5 font-medium text-white transition hover:bg-ink/90">
            Создать маршрут
          </button>
        </div>
      </div>
    </header>
  )
}
