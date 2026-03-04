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
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const targetPath = useMemo(() => {
    if (location.pathname.startsWith('/community')) return '/community'
    return '/routes'
  }, [location.pathname])

  useEffect(() => {
    if (!user) return
    const trimmed = query.trim()
    if (trimmed.length < 2) return

    const timer = setTimeout(async () => {
      try {
        setResults(await searchService.search(trimmed))
      } catch {
        setResults(null)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query, user])

  const handleSearch = () => {
    const next = new URLSearchParams(params)
    if (query.trim()) next.set('q', query.trim())
    else next.delete('q')

    navigate(`${targetPath}?${next.toString()}`)
    setIsMenuOpen(false)
    setResults(null)
  }

  const showResults = Boolean(user && query.trim().length >= 2 && results)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-sand/90 backdrop-blur-xl dark:border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">TravelBuddy</Link>
        <nav className="hidden gap-8 text-sm text-ink/80 md:flex">{navLinks.map(({ to, label }) => <NavLink key={to} to={to} className={({ isActive }) => `transition hover:text-ink ${isActive ? 'font-semibold text-ink' : ''}`}>{label}</NavLink>)}</nav>

        <div className="relative hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-ink/20 bg-white/80 px-3 py-2 dark:bg-white/5">
            <Search size={16} className="text-ink/60" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск маршрутов, постов, пользователей" className="w-64 bg-transparent text-sm outline-none" onKeyDown={(event) => event.key === 'Enter' && handleSearch()} />
          </div>
          <button onClick={handleSearch} className="rounded-full border border-ink/20 bg-white/70 px-3 py-2 text-sm hover:bg-white dark:bg-white/5">Найти</button>
          <button onClick={toggleTheme} className="rounded-full border border-ink/20 bg-white/70 p-2 hover:bg-white dark:bg-white/5" aria-label="Сменить тему">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>

          {isLoading ? <div className="h-10 w-24 animate-pulse rounded-full bg-white/60" /> : user ? <Link to="/profile" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-ink/90 transition hover:bg-white/70 dark:hover:bg-white/5"><img src={user.avatarUrl || DEFAULT_AVATAR_URL} alt={user.name} className="h-8 w-8 rounded-full border border-ink/10 object-cover" /><span className="hidden text-xs font-semibold lg:inline">{user.name}</span></Link> : <Link to="/login" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-ink/90 transition hover:bg-white/70 dark:hover:bg-white/5"><UserCircle2 size={18} /> Войти</Link>}
          <Link to="/routes#create" className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-sand transition hover:bg-ink/90">Создать маршрут</Link>

          {showResults ? <div className="absolute right-0 top-12 w-[420px] rounded-2xl border border-ink/15 bg-sand p-3 shadow-glow"><p className="mb-2 text-xs text-ink/70">Маршруты</p>{results!.routes.slice(0, 3).map((item) => <Link key={`route-${item.id}`} to={`/routes?q=${encodeURIComponent(item.title)}`} className="block rounded-lg px-2 py-1 text-sm hover:bg-ink/10">{item.title}</Link>)}<p className="mb-2 mt-3 text-xs text-ink/70">Публикации</p>{results!.posts.slice(0, 3).map((item) => <Link key={`post-${item.id}`} to={`/community?q=${encodeURIComponent(item.title)}`} className="block rounded-lg px-2 py-1 text-sm hover:bg-ink/10">{item.title}</Link>)}<p className="mb-2 mt-3 text-xs text-ink/70">Пользователи</p>{results!.users.slice(0, 3).map((item) => <Link key={`user-${item.id}`} to="/profile" className="block rounded-lg px-2 py-1 text-sm hover:bg-ink/10">{item.name} <span className="text-ink/60">{item.handle}</span></Link>)}</div> : null}
        </div>

        <button className="rounded-full border border-ink/20 p-2 md:hidden" onClick={() => setIsMenuOpen((prev) => !prev)}>{isMenuOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>

      {isMenuOpen ? <div className="space-y-3 border-t border-ink/10 bg-sand px-4 py-4 md:hidden"><div className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-ink/20 bg-white/80 px-3 py-2 text-sm dark:bg-white/5" placeholder="Поиск" /><button onClick={handleSearch} className="rounded-xl bg-ink px-3 py-2 text-sm text-sand">Найти</button></div><div className="flex flex-wrap items-center gap-2">{navLinks.map(({ to, label }) => <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} className="rounded-full border border-ink/15 px-3 py-2 text-sm">{label}</Link>)}<Link to="/routes#create" onClick={() => setIsMenuOpen(false)} className="rounded-full border border-ink/15 px-3 py-2 text-sm">Создать маршрут</Link>{user ? <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="rounded-full border border-ink/15 px-3 py-2 text-sm">Профиль</Link> : <Link to="/login" onClick={() => setIsMenuOpen(false)} className="rounded-full border border-ink/15 px-3 py-2 text-sm">Войти</Link>}<button onClick={toggleTheme} className="rounded-full border border-ink/15 p-2">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button></div></div> : null}
    </header>
  )
}
