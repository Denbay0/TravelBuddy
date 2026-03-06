import { Bookmark, Heart, MessageCircle, Send, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { ApiPostComment } from '../../../types/api'
import type { CommunityPost } from '../types'

type FeedPostCardProps = {
  post: CommunityPost
  comments?: ApiPostComment[]
  hasMoreComments?: boolean
  onShowMoreComments?: (post: CommunityPost) => void
  onToggleLike?: (post: CommunityPost) => void
  onToggleSave?: (post: CommunityPost) => void
  onComment?: (post: CommunityPost, content: string) => void
  isPending?: boolean
  canInteract?: boolean
  onAuthRequired?: () => void
}

export default function FeedPostCard({
  post,
  comments = [],
  hasMoreComments = false,
  onShowMoreComments,
  onToggleLike,
  onToggleSave,
  onComment,
  isPending,
  canInteract = true,
  onAuthRequired,
}: FeedPostCardProps) {
  const [comment, setComment] = useState('')
  const handleProtectedAction = (action: () => void) => {
    if (!canInteract) {
      onAuthRequired?.()
      return
    }
    action()
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-borderline/70 bg-surface shadow-glow">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3"><img src={post.author.avatarUrl} alt={post.author.name} className="h-11 w-11 rounded-full object-cover" /><div><p className="font-semibold">{post.author.name}</p><p className="text-xs text-muted">{post.route} · {post.date}</p></div></div>
        <span className="mt-1 inline-flex rounded-full border border-borderline/60 bg-sand px-2.5 py-1 text-[11px] text-ink/70">{post.transport}</span>
      </div>
      <div className="aspect-[16/10] overflow-hidden bg-sand"><img src={post.imageUrl} alt={post.route} className="h-full w-full object-cover" loading="lazy" /></div>
      <div className="space-y-4 px-5 py-4"><p className="text-sm leading-relaxed text-ink/80">{post.caption}</p>
        <div className="flex items-center justify-between border-t border-borderline/60 pt-3 text-sm text-ink/70"><div className="flex items-center gap-4"><button disabled={isPending} onClick={() => handleProtectedAction(() => onToggleLike?.(post))} className="inline-flex items-center gap-1.5 transition hover:text-ink disabled:opacity-50"><Heart size={16} className={post.liked ? 'fill-current' : ''} /> {post.likes}</button><span className="inline-flex items-center gap-1.5"><MessageCircle size={16} /> {post.comments}</span><button className="inline-flex items-center gap-1.5 transition hover:text-ink"><Share2 size={16} /> Поделиться</button></div><button disabled={isPending} onClick={() => handleProtectedAction(() => onToggleSave?.(post))} className="inline-flex items-center gap-1.5 transition hover:text-ink disabled:opacity-50"><Bookmark size={16} className={post.saved ? 'fill-current' : ''} />Сохранить</button></div>

        {comments.length > 0 ? (
          <div className="space-y-3 rounded-2xl border border-borderline/60 bg-sand/40 p-3">
            {comments.map((item) => (
              <div key={item.id} className="rounded-xl border border-borderline/50 bg-surface px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-xs text-muted">
                  <span className="font-medium text-ink/80">{item.owner.name}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
                <p className="mt-1 text-sm text-ink/80">{item.content}</p>
              </div>
            ))}
            {hasMoreComments ? (
              <button
                type="button"
                onClick={() => onShowMoreComments?.(post)}
                className="w-full rounded-xl border border-borderline/70 bg-surface px-3 py-2 text-sm text-ink/75 transition hover:text-ink"
              >
                Показать ещё
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex gap-2"><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={2} placeholder="Оставьте комментарий о маршруте" className="w-full resize-none rounded-xl border border-borderline/70 px-3 py-2 text-sm outline-none" /><button onClick={() => handleProtectedAction(() => { const next = comment.trim(); if (!next) return; onComment?.(post, next); setComment('') })} className="rounded-xl bg-accent px-3 py-2 text-[rgb(var(--color-accent-contrast))]"><Send size={15} /></button></div>
        {!canInteract ? <p className="text-xs text-muted">Лайки, сохранения и комментарии доступны после входа.</p> : null}
      </div>
    </article>
  )
}
