import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ProfileHeader } from '../features/profile/components/ProfileHeader'
import { ProfileSection } from '../features/profile/components/ProfileSection'
import { ProfileStats } from '../features/profile/components/ProfileStats'
import { mapApiUserToProfile } from '../features/profile/mappers'
import { profileService } from '../services/profileService'
import type { ApiProfileFavoriteRoute, ApiProfilePost } from '../types/api'
import type { UserProfile } from '../features/profile/types'
import { useAuth } from '../auth/useAuth'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profilePosts, setProfilePosts] = useState<ApiProfilePost[]>([])
  const [favoriteRoutes, setFavoriteRoutes] = useState<ApiProfileFavoriteRoute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '', homeCity: '', travelTagline: '', travelTags: '' })
  const { user, isLoading: isAuthLoading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      return
    }

    async function loadProfile() {
      setIsLoading(true)
      setError('')

      try {
        const [apiProfile, postsResponse, favoriteRoutesResponse] = await Promise.all([
          profileService.me(),
          profileService.myPosts(),
          profileService.myFavoriteRoutes(),
        ])

        setProfile(mapApiUserToProfile(apiProfile))
        setProfilePosts(postsResponse.items)
        setFavoriteRoutes(favoriteRoutesResponse.items)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить профиль.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [user])

  const postsSubtitle = useMemo(() => `${profilePosts.length} публикации в ленте`, [profilePosts.length])



  const openEdit = () => {
    if (!profile) return
    setEditForm({
      name: profile.name,
      bio: profile.bio,
      homeCity: profile.homeCity,
      travelTagline: profile.travelTagline,
      travelTags: profile.travelTags.join(', '),
    })
    setIsEditOpen(true)
  }

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile) return
    setError('')
    try {
      const response = await profileService.updateMe({
        name: editForm.name,
        bio: editForm.bio,
        homeCity: editForm.homeCity,
        travelTagline: editForm.travelTagline,
        travelTags: editForm.travelTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      })
      setProfile(mapApiUserToProfile(response.profile))
      setIsEditOpen(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить профиль.')
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Не удалось выйти из аккаунта.')
      setIsLoggingOut(false)
    }
  }

  if (isAuthLoading) {
    return <main className="mx-auto w-full max-w-6xl px-6 py-10 text-ink/70">Проверяем авторизацию...</main>
  }

  if (!user) {
    return <Navigate to="/login" replace />
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

      <ProfileHeader profile={profile} onEdit={openEdit} onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <ProfileSection title="Статистика путешествий" subtitle={`Домашний город: ${profile.homeCity}`}>
        <ProfileStats stats={profile.stats} />
      </ProfileSection>


      <ProfileSection title="Теги путешественника" subtitle="Темы и стили ваших поездок">
        <div className="flex flex-wrap gap-2">
          {profile.travelTags.length > 0 ? profile.travelTags.map((tag) => (
            <span key={tag} className="rounded-full border border-borderline/70 bg-surface px-3 py-1 text-xs">#{tag}</span>
          )) : <p className="text-sm text-ink/70">Добавьте теги в профиле: например, горы, гастро, city-break.</p>}
        </div>
      </ProfileSection>

      <ProfileSection title="Фотоистории из поездок" subtitle={postsSubtitle}>
        {profilePosts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-borderline/70 bg-surface px-4 py-4 text-sm text-ink/65">
            У вас пока нет публикаций.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {profilePosts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-borderline/60 bg-surface p-4">
                <h3 className="font-semibold text-ink">{post.title}</h3>
                <p className="mt-2 text-sm text-ink/65">Город: {post.city}</p>
                <p className="mt-3 text-xs text-ink/55">{new Date(post.createdAt).toLocaleDateString('ru-RU')}</p>
              </article>
            ))}
          </div>
        )}
      </ProfileSection>

      <ProfileSection title="Избранные маршруты" subtitle={`${favoriteRoutes.length} маршрута в коллекции`}>
        {favoriteRoutes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-borderline/70 bg-surface px-4 py-4 text-sm text-ink/65">
            У вас пока нет избранных маршрутов.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {favoriteRoutes.map((route) => (
              <article key={route.id} className="rounded-2xl border border-borderline/60 bg-surface p-4">
                <h3 className="font-semibold text-ink">{route.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{route.cities.join(' → ')}</p>
                <p className="mt-3 text-xs text-ink/55">{route.durationDays} дней</p>
              </article>
            ))}
          </div>
        )}
      </ProfileSection>
      {isEditOpen ? (
        <div className="fixed inset-0 z-[70] bg-ink/40 p-4" onClick={() => setIsEditOpen(false)}>
          <form onSubmit={handleSaveProfile} onClick={(event) => event.stopPropagation()} className="mx-auto mt-16 max-w-xl rounded-3xl bg-surface p-6">
            <h3 className="text-xl font-semibold">Редактировать профиль</h3>
            <div className="mt-4 grid gap-3">
              <input value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} className="rounded-xl border border-ink/15 px-3 py-2" placeholder="Имя" />
              <input value={editForm.travelTagline} onChange={(e) => setEditForm((prev) => ({ ...prev, travelTagline: e.target.value }))} className="rounded-xl border border-ink/15 px-3 py-2" placeholder="Короткий слоган" />
              <input value={editForm.homeCity} onChange={(e) => setEditForm((prev) => ({ ...prev, homeCity: e.target.value }))} className="rounded-xl border border-borderline/70 px-3 py-2" placeholder="Домашний город" />
              <input value={editForm.travelTags} onChange={(e) => setEditForm((prev) => ({ ...prev, travelTags: e.target.value }))} className="rounded-xl border border-borderline/70 px-3 py-2" placeholder="Теги через запятую: горы, авто, море" />
              <textarea value={editForm.bio} onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))} rows={3} className="rounded-xl border border-borderline/70 px-3 py-2" placeholder="О себе" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-full border border-borderline/70 px-4 py-2 text-sm">Отмена</button>
              <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm text-white">Сохранить</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}
