import { Menu, Moon, Search, Sun, UserCircle2, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useTheme } from '../features/theme/ThemeContext'

const navLinks = [
  { to: '/routes', label: 'Маршруты' },
  { to: '/community', label: 'Сообщество' },
] as const

const DEFAULT_AVATAR_URL = '/media/avatars/default.svg'

export default function AppHeader() {
  const { user, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const handleSearch = () => {
    const target = location.pathname.startsWith('/community') ? '/community' : '/routes'
    const next = new URLSearchParams(params)
    if (query.trim()) {
      next.set('q', query.trim())
    } else {
      next.delete('q')
    }
    navigate(`${target}?${next.toString()}`)
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-sand/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">TravelBuddy</Link>

        <nav className="hidden gap-8 text-sm text-ink/70 md:flex">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `transition hover:text-ink ${isActive ? 'font-semibold text-ink' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-ink/20 bg-white/70 px-3 py-2">
            <Search size={16} className="text-ink/55" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск маршрутов и постов"
              className="w-48 bg-transparent text-sm outline-none"
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="rounded-full border border-ink/15 px-3 py-2 text-sm hover:bg-white/70">Найти</button>
          <button onClick={toggleTheme} className="rounded-full border border-ink/15 p-2 hover:bg-white/70" aria-label="Сменить тему">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isLoading ? <div className="h-10 w-24 animate-pulse rounded-full bg-white/60" /> : user ? (
            <Link to="/profile" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-ink/80 transition hover:bg-white/70 hover:text-ink">
              <img src={user.avatarUrl || DEFAULT_AVATAR_URL} alt={user.name} className="h-8 w-8 rounded-full border border-ink/10 object-cover" />
              <span className="hidden leading-tight lg:inline">
                <span className="block text-xs font-semibold text-ink">{user.name}</span>
              </span>
            </Link>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-ink/80 transition hover:bg-white/70 hover:text-ink">
              <UserCircle2 size={18} /> Войти
            </Link>
          )}
          <Link to="/routes" className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-ink/90">Создать маршрут</Link>
        </div>

        <button className="rounded-full border border-ink/20 p-2 md:hidden" onClick={() => setIsMenuOpen((prev) => !prev)}>
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="space-y-3 border-t border-ink/10 bg-sand px-4 py-4 md:hidden">
          <div className="flex gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-ink/20 bg-white/80 px-3 py-2 text-sm" placeholder="Поиск" />
            <button onClick={handleSearch} className="rounded-xl bg-ink px-3 py-2 text-sm text-white">Найти</button>
          </div>
          <div className="flex items-center gap-2">
            {navLinks.map(({ to, label }) => <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} className="rounded-full border border-ink/15 px-3 py-2 text-sm">{label}</Link>)}
            <button onClick={toggleTheme} className="rounded-full border border-ink/15 p-2">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
