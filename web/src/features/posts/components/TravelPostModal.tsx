import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MessageCircle, Bookmark, Share2, X } from 'lucide-react'
import type { TravelPost, TransportCategory } from '../types'

const transportLabels: Record<TransportCategory, string> = {
  plane: 'Самолёт',
  train: 'Поезд',
  car: 'Авто',
  bus: 'Автобус',
  ferry: 'Паром',
  walk: 'Пешком',
}

type TravelPostModalProps = {
  post: TravelPost | null
  onClose: () => void
}

export function TravelPostModal({ post, onClose }: TravelPostModalProps) {
  return (
    <AnimatePresence>
      {post ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.article
            className="relative grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl md:grid-cols-2"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/85 p-2 text-ink transition hover:bg-white"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>

            <div className="h-72 md:h-full">
              <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
            </div>

            <div className="overflow-y-auto p-6">
              <div className="mb-3 flex items-center gap-2 text-xs text-ink/60">
                <span className="rounded-full border border-ink/10 bg-sand px-2.5 py-1">{transportLabels[post.transportCategory]}</span>
                <span>{post.location}</span>
              </div>

              <h3 className="text-2xl font-semibold text-ink">{post.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink/75">{post.caption}</p>

              <div className="mt-5 space-y-2 rounded-2xl border border-ink/10 bg-sand/70 p-4 text-sm text-ink/75">
                <p>
                  <span className="font-medium text-ink">Маршрут:</span> {post.routeLabel}
                </p>
                <p>
                  <span className="font-medium text-ink">Дата:</span> {post.date}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ink/75">
                <span className="inline-flex items-center gap-1.5"><Heart size={15} /> {post.likes}</span>
                <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} /> {post.comments}</span>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 transition hover:bg-sand">
                  <Bookmark size={15} /> Сохранить
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 transition hover:bg-sand">
                  <Share2 size={15} /> Поделиться
                </button>
              </div>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
