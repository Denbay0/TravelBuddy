import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import CommunityHeader from '../features/community/components/CommunityHeader'
import CreatePostModal, { type CommunityPostForm } from '../features/community/components/CreatePostModal'
import FeedPostCard, { type CommunityPost } from '../features/community/components/FeedPostCard'
import FeedSidebar from '../features/community/components/FeedSidebar'

const initialPosts: CommunityPost[] = [
  {
    id: 1,
    author: 'Ирина Смирнова',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    route: 'Лиссабон — Синтра',
    date: '12 марта 2026',
    imageUrl:
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=80',
    caption:
      'Утренний поезд до Синтры оказался идеальным: меньше людей, мягкий свет и много времени на спокойную прогулку по дворцам.',
    transport: 'Поезд',
    likes: 142,
    comments: 18,
    saved: true,
  },
  {
    id: 2,
    author: 'Максим Орлов',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    route: 'Тбилиси — Казбеги',
    date: '5 марта 2026',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
    caption:
      'Дорога заняла около трёх часов на автомобиле, но каждая остановка у обзорных точек стоила времени. Сохраняйте координаты заранее.',
    transport: 'Автомобиль',
    likes: 198,
    comments: 26,
  },
]

const popularAuthors = [
  {
    id: 1,
    name: 'Анна Ковалёва',
    focus: 'Европейские city-break маршруты',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Роман Жуков',
    focus: 'Поездки на поезде и автобусе',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 3,
    name: 'Ольга Веденеева',
    focus: 'Короткие маршруты у моря',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
]

const trendingRoutes = [
  { id: 1, name: 'Стамбул за 3 дня', meta: 'Пешком + трамвай · 1,8k сохранений' },
  { id: 2, name: 'Берлин и Потсдам', meta: 'Электричка · 1,2k сохранений' },
  { id: 3, name: 'Амальфитанское побережье', meta: 'Авто + паром · 2,4k сохранений' },
]

const emptyForm: CommunityPostForm = {
  imageUrl: '',
  caption: '',
  route: '',
  transport: 'Самолёт',
  date: '',
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<CommunityPostForm>(emptyForm)

  const handleFormChange = (field: keyof CommunityPostForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!form.imageUrl.trim() || !form.caption.trim() || !form.route.trim() || !form.date) {
      return
    }

    const createdPost: CommunityPost = {
      id: Date.now(),
      author: 'Вы',
      avatarUrl:
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80',
      route: form.route,
      date: new Date(form.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      imageUrl: form.imageUrl,
      caption: form.caption,
      transport: form.transport,
      likes: 0,
      comments: 0,
    }

    setPosts((prev) => [createdPost, ...prev])
    setForm(emptyForm)
    setIsModalOpen(false)
  }

  return (
    <div>
      <AppHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:py-10">
        <CommunityHeader onShareTrip={() => setIsModalOpen(true)} onCreatePost={() => setIsModalOpen(true)} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section className="space-y-5">
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </section>

          <FeedSidebar authors={popularAuthors} routes={trendingRoutes} />
        </div>
      </main>

      <CreatePostModal
        isOpen={isModalOpen}
        form={form}
        onClose={() => setIsModalOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
