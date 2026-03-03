import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import CommunityHeader from '../features/community/components/CommunityHeader'
import CreatePostModal, { type CommunityPostForm } from '../features/community/components/CreatePostModal'
import FeedPostCard from '../features/community/components/FeedPostCard'
import FeedSidebar from '../features/community/components/FeedSidebar'
import { initialPosts, popularAuthors, trendingRoutes } from '../features/community/mockData'
import type { CommunityPost } from '../features/community/types'
import type { User } from '../types/travel'

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

    const currentUser: User = {
      id: Date.now(),
      name: 'Вы',
      avatarUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80',
    }

    const createdPost: CommunityPost = {
      id: Date.now(),
      author: currentUser,
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
