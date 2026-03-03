import { Outlet } from 'react-router-dom'
import AppHeader from './components/AppHeader'

export default function App() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <Outlet />
      <footer className="border-t border-ink/10 px-6 py-10 text-sm text-ink/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p>© 2026 TravelBuddy</p>
          <div className="flex gap-5">
            <a href="#">О продукте</a>
            <a href="#">Блог</a>
            <a href="#">Политика</a>
            <a href="#">Условия</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
