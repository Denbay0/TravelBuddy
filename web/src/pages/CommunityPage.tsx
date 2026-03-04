import { useEffect, useMemo, useState } from 'react'
import CommunityHeader from '../features/community/components/CommunityHeader'
import CreatePostModal, { type CommunityPostForm } from '../features/community/components/CreatePostModal'
import FeedPostCard from '../features/community/components/FeedPostCard'
import FeedSidebar from '../features/community/components/FeedSidebar'
import { popularAuthors, trendingRoutes } from '../features/community/mockData'
import type { CommunityPost, TrendingRoute } from '../features/community/types'
import { communityService } from '../services/communityService'
import type { ApiPost } from '../types/api'
import type { User } from '../types/travel'
import { useSearchParams } from 'react-router-dom'

const emptyForm: CommunityPostForm = {
  imageUrl: '',
  caption: '',
  route: '',
  transport: 'Самолёт',
  date: '',
}

function mapApiPostToCommunityPost(post: ApiPost, imageUrl?: string): CommunityPost {
  return {
    id: post.id,
    author: {
      id: post.owner.id,
      name: post.owner.name,
      avatarUrl: `https://i.pravatar.cc/160?u=${post.owner.id}`,
    },
    route: post.city,
    date: new Date(post.createdAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    imageUrl: imageUrl || `https://source.unsplash.com/1600x900/?travel,${encodeURIComponent(post.city)}`,
    caption: post.content,
    transport: post.transport,
    likes: post.likesCount,
    comments: post.commentsCount,
    saved: post.isSaved,
    liked: post.isLiked,
  }
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<CommunityPostForm>(emptyForm)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pendingPostId, setPendingPostId] = useState<number | null>(null)

  const [authors, setAuthors] = useState<User[]>(popularAuthors)
  const [params] = useSearchParams()
  const [trending, setTrending] = useState<TrendingRoute[]>(trendingRoutes)

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true)
      setError('')

      try {
        const [feedResponse, popularUsersResponse, trendingRoutesResponse] = await Promise.all([
          communityService.getFeed({ page: 1, limit: 20 }),
          communityService.getPopularUsers(1, 5),
          communityService.getTrendingRoutes(1, 5),
        ])
        setPosts(feedResponse.items.map((post) => mapApiPostToCommunityPost(post)))
        setAuthors(popularUsersResponse.length > 0 ? popularUsersResponse : popularAuthors)
        setTrending(trendingRoutesResponse.length > 0 ? trendingRoutesResponse : trendingRoutes)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить ленту сообщества.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadPosts()
  }, [])

  const handleFormChange = (field: keyof CommunityPostForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.caption.trim() || !form.route.trim()) {
      return
    }

    try {
      const createdPost = await communityService.createPost({
        title: form.caption.slice(0, 50) || `Пост о маршруте ${form.route}`,
        content: form.caption,
        city: form.route,
      })

      setPosts((prev) => [mapApiPostToCommunityPost(createdPost, form.imageUrl || undefined), ...prev])
      setForm(emptyForm)
      setIsModalOpen(false)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Не удалось создать публикацию.')
    }
  }

  const handleToggleLike = async (post: CommunityPost) => {
    setPendingPostId(post.id)
    try {
      const response = await communityService.toggleLike(post.id, Boolean(post.liked))
      setPosts((prev) =>
        prev.map((item) =>
          item.id === post.id
            ? { ...item, liked: response.liked, saved: response.isSaved, likes: response.likes }
            : item,
        ),
      )
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Не удалось обновить лайк.')
    } finally {
      setPendingPostId(null)
    }
  }

  const handleToggleSave = async (post: CommunityPost) => {
    setPendingPostId(post.id)
    try {
      const response = await communityService.toggleSave(post.id, Boolean(post.saved))
      setPosts((prev) =>
        prev.map((item) =>
          item.id === post.id
            ? { ...item, saved: response.isSaved, liked: response.liked, likes: response.likes }
            : item,
        ),
      )
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Не удалось обновить сохранение.')
    } finally {
      setPendingPostId(null)
    }
  }

  const handleComment = async (post: CommunityPost, content: string) => {
    if (!content?.trim()) return
    try {
      await communityService.addComment(post.id, content)
      setPosts((prev) => prev.map((item) => (item.id === post.id ? { ...item, comments: item.comments + 1 } : item)))
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : 'Не удалось добавить комментарий.')
    }
  }

  const query = (params.get('q') || '').toLowerCase().trim()
  const visiblePosts = useMemo(() => posts.filter((post) => !query || post.caption.toLowerCase().includes(query) || post.route.toLowerCase().includes(query)), [posts, query])

  return (
    <>
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:py-10">
        <CommunityHeader onCreatePost={() => setIsModalOpen(true)} />
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section className="space-y-5">
            {isLoading ? <p className="text-sm text-ink/65">Загрузка публикаций...</p> : null}
            {visiblePosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onComment={handleComment}
                isPending={pendingPostId === post.id}
              />
            ))}
          </section>

          <FeedSidebar authors={authors} routes={trending} />
        </div>
      </main>

      <CreatePostModal
        isOpen={isModalOpen}
        form={form}
        onClose={() => setIsModalOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </>
  )
}
