import { Menu, Moon, Search, Sun, UserCircle2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useTheme } from '../features/theme/ThemeContext'
import { searchService } from '../services/searchService'
import type { SearchResponse } from '../types/api'

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
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [searchHint, setSearchHint] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const targetPath = useMemo(() => {
    if (location.pathname.startsWith('/community')) return '/community'
    return '/routes'
  }, [location.pathname])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return

    const timer = setTimeout(async () => {
      try {
        const response = await searchService.search(trimmed)
        setResults(response)
        const total = response.routes.length + response.posts.length + response.users.length
        setSearchHint(total === 0 ? 'Ничего не найдено. Попробуйте изменить запрос.' : '')
      } catch {
        setResults(null)
        setSearchHint('Поиск временно недоступен. Попробуйте ещё раз чуть позже.')
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = () => {
    const next = new URLSearchParams(params)
    if (query.trim()) next.set('q', query.trim())
    else next.delete('q')

    navigate(`${targetPath}?${next.toString()}`)
    setIsMenuOpen(false)
  }

  const showResults = Boolean(query.trim().length >= 2)

  return (
    <header className="sticky top-0 z-50 border-b border-borderline/70 bg-sand/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">TravelBuddy</Link>
        <nav className="hidden gap-8 text-sm text-ink/80 md:flex">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `transition hover:text-ink ${isActive ? 'font-semibold text-ink' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="relative hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-borderline/70 bg-surface px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              value={query}
              onChange={(event) => {
                const next = event.target.value
                setQuery(next)
                if (next.trim().length < 2) {
                  setResults(null)
                  setSearchHint('')
                }
              }}
              placeholder="Поиск маршрутов, постов, пользователей"
              className="w-64 bg-transparent text-sm outline-none"
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="btn-secondary px-4 py-2">Найти</button>
          <button onClick={toggleTheme} className="btn-outline rounded-full p-2" aria-label="Сменить тему">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-surface" />
          ) : user ? (
            <Link to="/profile" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium transition hover:bg-ink/5">
              <img src={user.avatarUrl || DEFAULT_AVATAR_URL} alt={user.name} className="h-8 w-8 rounded-full border border-borderline/60 object-cover" />
              <span className="hidden text-xs font-semibold lg:inline">{user.name}</span>
            </Link>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium transition hover:bg-ink/5">
              <UserCircle2 size={18} /> Войти
            </Link>
          )}
          <Link to={user ? '/routes#create' : '/login'} className="btn-primary">Создать маршрут</Link>

          {showResults ? (
            <div className="absolute right-0 top-12 w-[440px] rounded-2xl border border-borderline/70 bg-surface p-3 shadow-glow">
              {searchHint ? <p className="mb-1 rounded-xl bg-sand px-3 py-2 text-sm text-ink/85">{searchHint}</p> : null}
              {results ? (
                <>
                  <p className="mb-2 text-xs text-muted">Маршруты</p>
                  {results.routes.slice(0, 3).map((item) => (
                    <Link key={`route-${item.id}`} to={`/routes?q=${encodeURIComponent(item.title)}`} className="block rounded-lg px-2 py-1 text-sm hover:bg-sand">
                      {item.title}
                    </Link>
                  ))}
                  <p className="mb-2 mt-3 text-xs text-muted">Публикации</p>
                  {results.posts.slice(0, 3).map((item) => (
                    <Link key={`post-${item.id}`} to={`/community?q=${encodeURIComponent(item.title)}`} className="block rounded-lg px-2 py-1 text-sm hover:bg-sand">
                      {item.title}
                    </Link>
                  ))}
                  <p className="mb-2 mt-3 text-xs text-muted">Пользователи</p>
                  {results.users.slice(0, 3).map((item) => (
                    <Link key={`user-${item.id}`} to="/profile" className="block rounded-lg px-2 py-1 text-sm hover:bg-sand">
                      {item.name} <span className="text-muted">{item.handle}</span>
                    </Link>
                  ))}
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <button className="btn-outline rounded-full p-2 md:hidden" onClick={() => setIsMenuOpen((prev) => !prev)}>
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="space-y-3 border-t border-borderline/70 bg-sand px-4 py-4 md:hidden">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(event) => {
                const next = event.target.value
                setQuery(next)
                if (next.trim().length < 2) {
                  setResults(null)
                  setSearchHint('')
                }
              }}
              className="form-control rounded-xl px-3 py-2"
              placeholder="Поиск"
            />
            <button onClick={handleSearch} className="btn-primary rounded-xl px-3 py-2">Найти</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} className="btn-outline px-3 py-2">
                {label}
              </Link>
            ))}
            <Link to={user ? '/routes#create' : '/login'} onClick={() => setIsMenuOpen(false)} className="btn-secondary px-3 py-2">
              Создать маршрут
            </Link>
            {user ? (
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="btn-outline px-3 py-2">Профиль</Link>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-outline px-3 py-2">Войти</Link>
            )}
            <button onClick={toggleTheme} className="btn-outline rounded-full p-2">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          {searchHint ? <p className="text-sm text-muted">{searchHint}</p> : null}
        </div>
      ) : null}
    </header>
  )
}
