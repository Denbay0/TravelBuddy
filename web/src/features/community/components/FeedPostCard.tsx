import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'

export type CommunityPost = {
  id: number
  author: string
  avatarUrl: string
  route: string
  date: string
  imageUrl: string
  caption: string
  transport: string
  likes: number
  comments: number
  saved?: boolean
}

type FeedPostCardProps = {
  post: CommunityPost
}

export default function FeedPostCard({ post }: FeedPostCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-glow">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <img src={post.avatarUrl} alt={post.author} className="h-11 w-11 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-ink">{post.author}</p>
            <p className="text-xs text-ink/60">{post.route}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink/55">{post.date}</p>
          <span className="mt-1 inline-flex rounded-full border border-ink/10 bg-sand px-2.5 py-1 text-[11px] text-ink/70">
            {post.transport}
          </span>
        </div>
      </div>

      <div className="aspect-[16/10] overflow-hidden bg-sand">
        <img src={post.imageUrl} alt={post.route} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <div className="space-y-4 px-5 py-4">
        <p className="text-sm leading-relaxed text-ink/80">{post.caption}</p>

        <div className="flex items-center justify-between border-t border-ink/10 pt-3 text-sm text-ink/70">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-1.5 transition hover:text-ink">
              <Heart size={16} /> {post.likes}
            </button>
            <button className="inline-flex items-center gap-1.5 transition hover:text-ink">
              <MessageCircle size={16} /> {post.comments}
            </button>
            <button className="inline-flex items-center gap-1.5 transition hover:text-ink">
              <Share2 size={16} /> Поделиться
            </button>
          </div>
          <button className="inline-flex items-center gap-1.5 transition hover:text-ink">
            <Bookmark size={16} className={post.saved ? 'fill-current' : ''} />
            Сохранить
          </button>
        </div>
      </div>
    </article>
  )
}
