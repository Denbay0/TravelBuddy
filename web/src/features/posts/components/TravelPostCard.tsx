import { MessageCircle, Heart } from 'lucide-react'
import type { TravelPost, TransportCategory } from '../types'

const transportLabels: Record<TransportCategory, string> = {
  plane: 'Самолёт',
  train: 'Поезд',
  car: 'Авто',
  bus: 'Автобус',
  ferry: 'Паром',
  walk: 'Пешком',
}

type TravelPostCardProps = {
  post: TravelPost
  onClick?: (post: TravelPost) => void
}

export function TravelPostCard({ post, onClick }: TravelPostCardProps) {
  return (
    <article
      className="group overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-glow transition hover:-translate-y-0.5 hover:shadow-xl"
      onClick={() => onClick?.(post)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick?.(post)
        }
      }}
    >
      <div className="aspect-[4/3] overflow-hidden bg-sand">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-semibold text-ink">{post.title}</h3>
          <span className="shrink-0 rounded-full border border-ink/10 bg-sand px-3 py-1 text-xs text-ink/75">
            {transportLabels[post.transportCategory]}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-ink/70">{post.caption}</p>

        <div className="flex items-center justify-between text-xs text-ink/60">
          <span>{post.date}</span>
          <span>{post.location}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-ink/70">
          <span className="inline-flex items-center gap-1.5">
            <Heart size={15} /> {post.likes}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle size={15} /> {post.comments}
          </span>
        </div>
      </div>
    </article>
  )
}
