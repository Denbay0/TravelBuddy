import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import CommunityHeader from '../features/community/components/CommunityHeader'
import CreatePostModal, { type CommunityPostForm } from '../features/community/components/CreatePostModal'
import FeedPostCard from '../features/community/components/FeedPostCard'
import FeedSidebar from '../features/community/components/FeedSidebar'
import { popularAuthors, trendingRoutes } from '../features/community/mockData'
import type { CommunityPost, TrendingRoute } from '../features/community/types'
import { isAuthError } from '../lib/authGuards'
import { communityService } from '../services/communityService'
import type { ApiPost, ApiPostComment } from '../types/api'
import type { User } from '../types/travel'

const emptyForm: CommunityPostForm = {
  imageUrl: '',
  caption: '',
  route: '',
  transport: 'Самолёт',
  date: '',
}

function formatCommunityDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function mapApiPostToCommunityPost(
  post: ApiPost,
  imageUrl?: string,
  overrides?: Partial<Pick<CommunityPost, 'date' | 'transport'>>,
): CommunityPost {
  return {
    id: post.id,
    author: {
      id: post.owner.id,
      name: post.owner.name,
      avatarUrl: `https://i.pravatar.cc/160?u=${post.owner.id}`,
    },
    route: post.city,
    date: overrides?.date ?? formatCommunityDate(post.tripDate || post.createdAt),
    imageUrl:
      imageUrl || `https://source.unsplash.com/1600x900/?travel,${encodeURIComponent(post.city)}`,
    caption: post.content,
    transport: overrides?.transport ?? post.transport,
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
  const [trending, setTrending] = useState<TrendingRoute[]>(trendingRoutes)
  const [params] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const openLoginHint = (text: string) => {
    setError(text)
    setTimeout(() => navigate('/login'), 600)
  }

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
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить ленту сообщества.',
        )
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
    if (!user) {
      openLoginHint('Чтобы поделиться поездкой, войдите или зарегистрируйтесь.')
      return
    }
    if (!form.caption.trim() || !form.route.trim()) return

    try {
      const submittedForm = { ...form }
      const createdPost = await communityService.createPost({
        title: submittedForm.caption.slice(0, 50) || `Пост о маршруте ${submittedForm.route}`,
        content: submittedForm.caption,
        city: submittedForm.route,
        transport: submittedForm.transport,
        tripDate: submittedForm.date || undefined,
      })

      setPosts((prev) => [
        mapApiPostToCommunityPost(createdPost, submittedForm.imageUrl || undefined, {
          date: submittedForm.date ? formatCommunityDate(submittedForm.date) : undefined,
          transport: submittedForm.transport,
        }),
        ...prev,
      ])
      setForm(emptyForm)
      setIsModalOpen(false)
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : 'Не удалось создать публикацию.',
      )
    }
  }

  const handleToggleLike = async (post: CommunityPost) => {
    if (!user) return openLoginHint('Лайки доступны после входа в аккаунт.')
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
      setError(
        isAuthError(actionError)
          ? 'Лайки доступны после входа в аккаунт.'
          : actionError instanceof Error
            ? actionError.message
            : 'Не удалось обновить лайк.',
      )
    } finally {
      setPendingPostId(null)
    }
  }

  const handleToggleSave = async (post: CommunityPost) => {
    if (!user) return openLoginHint('Чтобы сохранять публикации, войдите в аккаунт.')
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
      setError(
        isAuthError(actionError)
          ? 'Чтобы сохранять публикации, войдите в аккаунт.'
          : actionError instanceof Error
            ? actionError.message
            : 'Не удалось обновить сохранение.',
      )
    } finally {
      setPendingPostId(null)
    }
  }

  const handleComment = async (
    post: CommunityPost,
    content: string,
  ): Promise<ApiPostComment | null> => {
    if (!content.trim()) {
      return null
    }

    if (!user) {
      openLoginHint('Комментарии доступны после входа в аккаунт.')
      return null
    }

    try {
      const createdComment = await communityService.addComment(post.id, content)
      setPosts((prev) =>
        prev.map((item) =>
          item.id === post.id ? { ...item, comments: item.comments + 1 } : item,
        ),
      )
      return createdComment
    } catch (commentError) {
      setError(
        isAuthError(commentError)
          ? 'Комментарии доступны после входа в аккаунт.'
          : commentError instanceof Error
            ? commentError.message
            : 'Не удалось добавить комментарий.',
      )
      return null
    }
  }

  const query = (params.get('q') || '').toLowerCase().trim()
  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          !query ||
          post.caption.toLowerCase().includes(query) ||
          post.route.toLowerCase().includes(query),
      ),
    [posts, query],
  )

  return (
    <>
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:py-10">
        <CommunityHeader
          onCreatePost={() =>
            user
              ? setIsModalOpen(true)
              : openLoginHint('Чтобы поделиться поездкой, войдите или зарегистрируйтесь.')
          }
          createHint={!user ? 'Публикация доступна после авторизации.' : undefined}
        />
        {error ? (
          <div className="rounded-2xl border border-amber/40 bg-amber/15 px-4 py-3 text-sm text-ink/90">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section className="space-y-5">
            {isLoading ? <p className="text-sm text-ink/65">Загрузка публикаций...</p> : null}
            {!isLoading && visiblePosts.length === 0 ? (
              <div className="rounded-2xl border border-borderline/60 bg-surface px-5 py-6 text-sm text-ink/80">
                Ничего не найдено. Попробуйте изменить запрос или поищите по названию
                маршрута/города.
              </div>
            ) : null}
            {visiblePosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onComment={handleComment}
                isPending={pendingPostId === post.id}
                canInteract={Boolean(user)}
                onAuthRequired={() =>
                  openLoginHint('Это действие доступно только после входа в аккаунт.')
                }
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
