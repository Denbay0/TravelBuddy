import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileHeader } from '../features/profile/components/ProfileHeader'
import { ProfileSection } from '../features/profile/components/ProfileSection'
import { ProfileStats } from '../features/profile/components/ProfileStats'
import { mapApiUserToProfile } from '../features/profile/mappers'
import { TravelPhotoGrid } from '../features/posts/components/TravelPhotoGrid'
import { mockTravelPosts } from '../features/posts/mockData'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import type { UserProfile } from '../features/profile/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true)
      setError('')

      try {
        const apiProfile = await profileService.me()
        setProfile(mapApiUserToProfile(apiProfile))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить профиль.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const postsSubtitle = useMemo(() => `${mockTravelPosts.length} публикации в ленте`, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
      navigate('/login')
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Не удалось выйти из аккаунта.')
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return <main className="mx-auto w-full max-w-6xl px-6 py-10 text-ink/70">Загрузка профиля...</main>
  }

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Профиль недоступен. Попробуйте снова позже.'}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10">
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <ProfileHeader profile={profile} onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <ProfileSection title="Статистика путешествий" subtitle={`Домашний город: ${profile.homeCity}`}>
        <ProfileStats stats={profile.stats} />
      </ProfileSection>

      <ProfileSection title="Фотоистории из поездок" subtitle={postsSubtitle}>
        <TravelPhotoGrid posts={mockTravelPosts} />
      </ProfileSection>

      <ProfileSection title="Избранные маршруты" subtitle={`${profile.favoriteRoutes.length} маршрута в коллекции`}>
        {profile.favoriteRoutes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/20 bg-white px-4 py-4 text-sm text-ink/65">
            Здесь появятся избранные маршруты после подключения соответствующего API.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {profile.favoriteRoutes.map((route) => (
              <article key={route.id} className="rounded-2xl border border-ink/10 bg-white p-4">
                <h3 className="font-semibold text-ink">{route.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{route.cities.join(' → ')}</p>
                <p className="mt-3 text-xs text-ink/55">{route.durationDays} дней</p>
              </article>
            ))}
          </div>
        )}
      </ProfileSection>
    </main>
  )
}
