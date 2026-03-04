import { Bookmark, Heart, MessageCircle, Send, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { CommunityPost } from '../types'

type FeedPostCardProps = {
  post: CommunityPost
  onToggleLike?: (post: CommunityPost) => void
  onToggleSave?: (post: CommunityPost) => void
  onComment?: (post: CommunityPost, content: string) => void
  isPending?: boolean
}

export default function FeedPostCard({ post, onToggleLike, onToggleSave, onComment, isPending }: FeedPostCardProps) {
  const [comment, setComment] = useState('')
  return (
    <article className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-glow dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3"><img src={post.author.avatarUrl} alt={post.author.name} className="h-11 w-11 rounded-full object-cover" /><div><p className="font-semibold">{post.author.name}</p><p className="text-xs text-ink/60">{post.route} · {post.date}</p></div></div>
        <span className="mt-1 inline-flex rounded-full border border-ink/10 bg-sand px-2.5 py-1 text-[11px] text-ink/70">{post.transport}</span>
      </div>
      <div className="aspect-[16/10] overflow-hidden bg-sand"><img src={post.imageUrl} alt={post.route} className="h-full w-full object-cover" loading="lazy" /></div>
      <div className="space-y-4 px-5 py-4"><p className="text-sm leading-relaxed text-ink/80">{post.caption}</p>
        <div className="flex items-center justify-between border-t border-ink/10 pt-3 text-sm text-ink/70"><div className="flex items-center gap-4"><button disabled={isPending} onClick={() => onToggleLike?.(post)} className="inline-flex items-center gap-1.5 transition hover:text-ink disabled:opacity-50"><Heart size={16} className={post.liked ? 'fill-current' : ''} /> {post.likes}</button><span className="inline-flex items-center gap-1.5"><MessageCircle size={16} /> {post.comments}</span><button className="inline-flex items-center gap-1.5 transition hover:text-ink"><Share2 size={16} /> Поделиться</button></div><button disabled={isPending} onClick={() => onToggleSave?.(post)} className="inline-flex items-center gap-1.5 transition hover:text-ink disabled:opacity-50"><Bookmark size={16} className={post.saved ? 'fill-current' : ''} />Сохранить</button></div>
        <div className="flex gap-2"><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Оставьте комментарий о маршруте" className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none" /><button onClick={() => { if (!comment.trim()) return; onComment?.(post, comment); setComment('') }} className="rounded-xl bg-ink px-3 py-2 text-white"><Send size={15} /></button></div>
      </div>
    </article>
  )
}
