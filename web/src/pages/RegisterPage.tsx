import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import { AuthCard } from '../components/ui/AuthCard'
import { InputField } from '../components/ui/InputField'
import { SubmitButton } from '../components/ui/SubmitButton'
import { authService } from '../services/authService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type RegisterValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type RegisterErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Введите имя.'
  }

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

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Подтвердите пароль.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Пароли не совпадают.'
  }

  return errors
}

export default function RegisterPage() {
  const [values, setValues] = useState<RegisterValues>({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setError('')
    setSuccess('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })

      setSuccess('Аккаунт создан! Перенаправляем на страницу входа...')
      setValues({ name: '', email: '', password: '', confirmPassword: '' })
      setTimeout(() => {
        navigate('/login')
      }, 500)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Что-то пошло не так. Повторите попытку.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen bg-hero-gradient px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-6 overflow-hidden rounded-[2rem] border border-white/50 bg-white/45 p-4 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
        <div className="order-2 flex items-center justify-center rounded-3xl bg-white/70 p-4 sm:p-6 lg:order-1">
          <AuthCard title="Создание аккаунта" subtitle="Начните своё travel-путешествие: маршруты, идеи и заметки в одном профиле.">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <InputField
                id="register-name"
                label="Имя"
                placeholder="Ваше имя"
                autoComplete="name"
                value={values.name}
                onChange={(name) => setValues((prev) => ({ ...prev, name }))}
                error={errors.name}
              />

              <InputField
                id="register-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={values.email}
                onChange={(email) => setValues((prev) => ({ ...prev, email }))}
                error={errors.email}
              />

              <InputField
                id="register-password"
                label="Пароль"
                type="password"
                placeholder="Минимум 8 символов"
                autoComplete="new-password"
                value={values.password}
                onChange={(password) => setValues((prev) => ({ ...prev, password }))}
                error={errors.password}
              />

              <InputField
                id="register-confirm-password"
                label="Подтверждение пароля"
                type="password"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(confirmPassword) => setValues((prev) => ({ ...prev, confirmPassword }))}
                error={errors.confirmPassword}
              />

              {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
              {success ? <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p> : null}

              <SubmitButton text="Зарегистрироваться" loadingText="Создаём аккаунт..." isSubmitting={isSubmitting} />

              <p className="text-center text-sm text-ink/70">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="font-medium text-amber hover:text-amber/80">
                  Войти
                </Link>
              </p>
            </form>
          </AuthCard>
        </div>

        <aside className="order-1 hidden rounded-3xl bg-gradient-to-br from-amber/90 via-amber to-pine p-8 text-white lg:order-2 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/70">Join TravelBuddy</p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight">Пусть каждая идея превратится в новый маршрут.</h2>
            <p className="mt-4 text-sm text-white/80">Создайте профиль, собирайте избранные места и делитесь впечатлениями с travel-сообществом.</p>
          </div>
          <div className="grid gap-3 text-sm text-white/90">
            <p className="rounded-2xl border border-white/35 bg-white/10 px-4 py-3">📍 Быстрое создание маршрутов</p>
            <p className="rounded-2xl border border-white/35 bg-white/10 px-4 py-3">🧭 Персональные travel-дайджесты</p>
            <p className="rounded-2xl border border-white/35 bg-white/10 px-4 py-3">🤝 Совместное планирование поездок</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
