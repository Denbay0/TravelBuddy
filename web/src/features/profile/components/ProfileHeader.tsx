import type { UserProfile } from '../types'

type ProfileHeaderProps = {
  profile: UserProfile
  onLogout?: () => void
  isLoggingOut?: boolean
}

export function ProfileHeader({ profile, onLogout, isLoggingOut = false }: ProfileHeaderProps) {
  return (
    <header className="card-surface flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <img
          src={profile.avatarUrl}
          alt={`Аватар пользователя ${profile.name}`}
          className="h-20 w-20 rounded-2xl object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold text-ink">{profile.name}</h1>
          <p className="mt-1 text-sm text-ink/70">{profile.travelTagline}</p>
          <p className="mt-2 text-sm text-ink/55">{profile.bio}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-ink/5">
          Редактировать профиль
        </button>
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? 'Выходим...' : 'Выйти'}
        </button>
      </div>
    </header>
  )
}
