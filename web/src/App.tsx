import { Link, Outlet } from 'react-router-dom'
import AppHeader from './components/AppHeader'

export default function App() {
  return (
    <div className="min-h-screen bg-sand">
      <AppHeader />
      <Outlet />
      <footer className="border-t border-borderline/70 bg-surface/80 px-6 py-10 text-sm text-ink/75">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p>© 2026 TravelBuddy</p>
          <div className="flex gap-5">
            <Link to="/about" className="hover:text-ink">О продукте</Link>
            <Link to="/blog" className="hover:text-ink">Блог</Link>
            <Link to="/policy" className="hover:text-ink">Политика</Link>
            <Link to="/terms" className="hover:text-ink">Условия</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
