import { ProfileHeader } from '../features/profile/components/ProfileHeader'
import { ProfileSection } from '../features/profile/components/ProfileSection'
import { ProfileStats } from '../features/profile/components/ProfileStats'
import { mockUserProfile } from '../features/profile/mockData'

export default function ProfilePage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10">
      <ProfileHeader profile={mockUserProfile} />

      <ProfileSection
        title="Статистика путешествий"
        subtitle={`Домашний город: ${mockUserProfile.homeCity}`}
      >
        <ProfileStats stats={mockUserProfile.stats} />
      </ProfileSection>

      <ProfileSection
        title="Избранные маршруты"
        subtitle={`${mockUserProfile.favoriteRoutes.length} маршрута в коллекции`}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {mockUserProfile.favoriteRoutes.map((route) => (
            <article key={route.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <h3 className="font-semibold text-ink">{route.title}</h3>
              <p className="mt-2 text-sm text-ink/65">{route.cities.join(' → ')}</p>
              <p className="mt-3 text-xs text-ink/55">{route.durationDays} дней</p>
            </article>
          ))}
        </div>
      </ProfileSection>
    </main>
  )
}
