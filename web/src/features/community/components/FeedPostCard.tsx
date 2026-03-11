import { Bookmark, Heart, MessageCircle, Send, Share2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isAuthError } from '../../../lib/authGuards'
import { postService } from '../../../services/postService'
import type { ApiPostComment } from '../../../types/api'
import type { CommunityPost } from '../types'

const COMMENTS_PAGE_SIZE = 3

type FeedPostCardProps = {
  post: CommunityPost
  onToggleLike?: (post: CommunityPost) => void
  onToggleSave?: (post: CommunityPost) => void
  onComment?: (post: CommunityPost, content: string) => Promise<ApiPostComment | null>
  isPending?: boolean
  canInteract?: boolean
  onAuthRequired?: () => void
}

function formatCommentDate(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function FeedPostCard({
  post,
  onToggleLike,
  onToggleSave,
  onComment,
  isPending,
  canInteract = true,
  onAuthRequired,
}: FeedPostCardProps) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<ApiPostComment[]>([])
  const [commentsPage, setCommentsPage] = useState(0)
  const [commentsTotal, setCommentsTotal] = useState(post.comments)
  const [commentsError, setCommentsError] = useState('')
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [shareFeedback, setShareFeedback] = useState('')
  const loadedCommentsPostIdRef = useRef<number | null>(null)
  const shareFeedbackTimeoutRef = useRef<number | null>(null)

  const handleProtectedAction = (action: () => void | Promise<void>) => {
    if (!canInteract) {
      onAuthRequired?.()
      return
    }

    void action()
  }

  const loadComments = useCallback(
    async (page: number, append: boolean) => {
      if (!canInteract) {
        return
      }

      setIsCommentsLoading(true)
      setCommentsError('')

      try {
        const response = await postService.comments(post.id, page, COMMENTS_PAGE_SIZE)
        setComments((prev) => {
          if (!append) {
            return response.items
          }

          const knownIds = new Set(prev.map((item) => item.id))
          const nextItems = response.items.filter((item) => !knownIds.has(item.id))
          return [...prev, ...nextItems]
        })
        setCommentsPage(response.page)
        setCommentsTotal(response.total)
      } catch (error) {
        if (isAuthError(error)) {
          onAuthRequired?.()
          return
        }

        setCommentsError(
          error instanceof Error ? error.message : 'Не удалось загрузить комментарии.',
        )
      } finally {
        setIsCommentsLoading(false)
      }
    },
    [canInteract, onAuthRequired, post.id],
  )

  useEffect(() => {
    setComments([])
    setCommentsPage(0)
    setCommentsTotal(post.comments)
    setCommentsError('')
    loadedCommentsPostIdRef.current = null
  }, [post.comments, post.id])

  useEffect(() => {
    setCommentsTotal(post.comments)
  }, [post.comments])

  useEffect(() => {
    if (!canInteract || post.comments === 0) {
      return
    }

    if (loadedCommentsPostIdRef.current === post.id) {
      return
    }

    loadedCommentsPostIdRef.current = post.id
    void loadComments(1, false)
  }, [canInteract, loadComments, post.comments, post.id])

  useEffect(
    () => () => {
      if (shareFeedbackTimeoutRef.current) {
        window.clearTimeout(shareFeedbackTimeoutRef.current)
      }
    },
    [],
  )

  const showShareFeedback = (message: string) => {
    setShareFeedback(message)

    if (shareFeedbackTimeoutRef.current) {
      window.clearTimeout(shareFeedbackTimeoutRef.current)
    }

    shareFeedbackTimeoutRef.current = window.setTimeout(() => {
      setShareFeedback('')
      shareFeedbackTimeoutRef.current = null
    }, 3_000)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        showShareFeedback('Ссылка скопирована в буфер обмена.')
        return
      } catch {
        // Fall back to the Web Share API or UI feedback below.
      }
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: post.route,
          text: post.caption,
          url: shareUrl,
        })
        showShareFeedback('Ссылка готова к отправке.')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    showShareFeedback('Поделиться можно вручную: ссылка уже в адресной строке.')
  }

  const handleCommentSubmit = async () => {
    const next = comment.trim()
    if (!next || !onComment) {
      return
    }

    setIsCommentSubmitting(true)

    try {
      const createdComment = await onComment(post, next)
      if (!createdComment) {
        return
      }

      setComments((prev) => {
        if (prev.some((item) => item.id === createdComment.id)) {
          return prev
        }

        return [...prev, createdComment]
      })
      setCommentsTotal((prev) => prev + 1)
      setComment('')
    } finally {
      setIsCommentSubmitting(false)
    }
  }

  const canLoadMoreComments = canInteract && comments.length < commentsTotal

  return (
    <article
      data-testid="community-post-card"
      className="overflow-hidden rounded-3xl border border-borderline/70 bg-surface shadow-glow"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatarUrl}
            alt={post.author.name}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <p data-testid="community-post-route-date" className="text-xs text-muted">
              {post.route} · {post.date}
            </p>
          </div>
        </div>
        <span
          data-testid="community-post-transport"
          className="mt-1 inline-flex rounded-full border border-borderline/60 bg-sand px-2.5 py-1 text-[11px] text-ink/70"
        >
          {post.transport}
        </span>
      </div>

      <div className="aspect-[16/10] overflow-hidden bg-sand">
        <img
          src={post.imageUrl}
          alt={post.route}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="space-y-4 px-5 py-4">
        <p data-testid="community-post-caption" className="text-sm leading-relaxed text-ink/80">
          {post.caption}
        </p>

        <div className="flex items-center justify-between border-t border-borderline/60 pt-3 text-sm text-ink/70">
          <div className="flex items-center gap-4">
            <button
              type="button"
              data-testid="community-post-like-button"
              aria-pressed={post.liked ? 'true' : 'false'}
              disabled={isPending}
              onClick={() => handleProtectedAction(() => onToggleLike?.(post))}
              className="inline-flex items-center gap-1.5 transition hover:text-ink disabled:opacity-50"
            >
              <Heart size={16} className={post.liked ? 'fill-current' : ''} />
              {post.likes}
            </button>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle size={16} />
              {commentsTotal}
            </span>
            <button
              type="button"
              data-testid="community-post-share-button"
              onClick={() => void handleShare()}
              className="inline-flex items-center gap-1.5 transition hover:text-ink"
            >
              <Share2 size={16} /> Поделиться
            </button>
          </div>
          <button
            type="button"
            data-testid="community-post-save-button"
            aria-pressed={post.saved ? 'true' : 'false'}
            disabled={isPending}
            onClick={() => handleProtectedAction(() => onToggleSave?.(post))}
            className="inline-flex items-center gap-1.5 transition hover:text-ink disabled:opacity-50"
          >
            <Bookmark size={16} className={post.saved ? 'fill-current' : ''} />
            Сохранить
          </button>
        </div>

        {shareFeedback ? (
          <p role="alert" className="text-xs font-medium text-emerald-600">
            {shareFeedback}
          </p>
        ) : null}

        {comments.length > 0 || commentsError || isCommentsLoading ? (
          <div
            data-testid="community-post-comments"
            className="space-y-3 rounded-2xl border border-borderline/60 bg-sand/30 px-3 py-3"
          >
            {comments.map((item) => (
              <div
                key={item.id}
                data-testid="community-post-comment-item"
                className="rounded-xl bg-surface px-3 py-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 text-xs text-muted">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{item.owner.name}</p>
                    <p className="truncate">{item.owner.handle}</p>
                  </div>
                  <span className="shrink-0">{formatCommentDate(item.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                  {item.content}
                </p>
              </div>
            ))}

            {isCommentsLoading ? (
              <p className="text-xs text-muted">Загрузка комментариев...</p>
            ) : null}
            {commentsError ? <p className="text-xs text-rose-500">{commentsError}</p> : null}
            {canLoadMoreComments && !isCommentsLoading ? (
              <button
                type="button"
                data-testid="community-post-comments-load-more"
                onClick={() => void loadComments(commentsPage + 1, true)}
                className="text-sm font-medium text-accent transition hover:opacity-80"
              >
                Смотреть далее
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex gap-2">
          <textarea
            data-testid="community-post-comment-input"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={2}
            placeholder="Оставьте комментарий о маршруте"
            className="w-full resize-none rounded-xl border border-borderline/70 px-3 py-2 text-sm outline-none"
          />
          <button
            data-testid="community-post-comment-submit"
            disabled={isCommentSubmitting}
            onClick={() => handleProtectedAction(handleCommentSubmit)}
            className="rounded-xl bg-accent px-3 py-2 text-[rgb(var(--color-accent-contrast))] disabled:opacity-60"
          >
            <Send size={15} />
          </button>
        </div>

        {!canInteract ? (
          <p className="text-xs text-muted">
            Лайки, сохранения и комментарии доступны после входа.
          </p>
        ) : null}
      </div>
    </article>
  )
}




