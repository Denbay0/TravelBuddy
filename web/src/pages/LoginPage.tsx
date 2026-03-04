import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import { AuthCard } from '../components/ui/AuthCard'
import { InputField } from '../components/ui/InputField'
import { SubmitButton } from '../components/ui/SubmitButton'
import { authService } from '../services/authService'
import { useAuth } from '../auth/useAuth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginValues = {
  email: string
  password: string
  rememberMe: boolean
}

type LoginErrors = {
  email?: string
  password?: string
}

function validate(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {}

  if (!values.email.trim()) {
    errors.email = 'Введите email.'
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Введите email в корректном формате.'
  }

  if (!values.password) {
    errors.password = 'Введите пароль.'
  } else if (values.password.length < 8) {
    errors.password = 'Пароль должен содержать минимум 8 символов.'
  }

  return errors
}

export default function LoginPage() {
  const [values, setValues] = useState<LoginValues>({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authService.login({ email: values.email, password: values.password, rememberMe: values.rememberMe })
      setUser(response.user)
      navigate('/profile', { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Что-то пошло не так. Повторите попытку.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen bg-hero-gradient px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 overflow-hidden rounded-[2rem] border border-borderline/70 bg-surface/70 p-4 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <aside className="hidden rounded-3xl bg-surface-elevated p-8 text-ink lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-ink/60">TravelBuddy</p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight">Возвращайтесь к вашим маршрутам и новым открытиям.</h2>
            <p className="mt-4 text-sm text-ink/70">Планируйте следующую поездку, сохраняйте идеи друзей и ведите личный travel-дневник в одном месте.</p>
          </div>
          <div className="rounded-2xl border border-borderline/70 bg-sand/70 p-5 text-sm text-ink/75">✈️ 24 сохранённых локации ждут вас в избранном.</div>
        </aside>

        <div className="flex items-center justify-center rounded-3xl bg-surface/75 p-4 sm:p-6">
          <AuthCard title="Вход в аккаунт" subtitle="С возвращением! Продолжайте своё путешествие с TravelBuddy.">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <InputField
                id="login-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={values.email}
                onChange={(email) => setValues((prev) => ({ ...prev, email }))}
                error={errors.email}
              />

              <InputField
                id="login-password"
                label="Пароль"
                type="password"
                placeholder="Введите пароль"
                autoComplete="current-password"
                value={values.password}
                onChange={(password) => setValues((prev) => ({ ...prev, password }))}
                error={errors.password}
              />

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="inline-flex items-center gap-2 text-ink/80">
                  <input
                    type="checkbox"
                    checked={values.rememberMe}
                    onChange={(event) => setValues((prev) => ({ ...prev, rememberMe: event.target.checked }))}
                    className="h-4 w-4 rounded border-borderline text-accent focus:ring-accent"
                  />
                  Запомнить меня
                </label>
                <a href="#" className="text-accent hover:text-accent/80">Забыли пароль?</a>
              </div>

              {error ? <p className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p> : null}
              <SubmitButton text="Войти" loadingText="Проверяем данные..." isSubmitting={isSubmitting} />

              <p className="text-center text-sm text-ink/70">
                Нет аккаунта?{' '}
                <Link to="/register" className="font-medium text-accent hover:text-accent/80">
                  Создать
                </Link>
              </p>
            </form>
          </AuthCard>
        </div>
      </div>
    </section>
  )
}
