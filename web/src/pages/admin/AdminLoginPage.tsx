import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../features/admin/auth/useAdminAuth'
import { env } from '../../config/env'

export default function AdminLoginPage() {
  const { admin, login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginValue, setLoginValue] = useState(env.adminLogin)
  const [password, setPassword] = useState(env.adminPassword)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (admin?.isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const redirectTarget = (location.state as { from?: string } | null)?.from || '/admin'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ login: loginValue, password })
      navigate(redirectTarget, { replace: true })
    } catch {
      setError('Неверные admin-учётные данные.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Вход в админку</h1>
        <p className="mt-2 text-sm text-ink/70">В dev-режиме используйте логин и пароль администратора из env.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Логин</span>
            <input
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              type="text"
              name="login"
              autoComplete="username"
              placeholder="admin"
              className="w-full rounded-xl border border-ink/20 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Пароль</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-ink/20 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25"
              required
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Входим...' : 'Войти в админку'}
          </button>
        </form>
      </div>
    </section>
  )
}
