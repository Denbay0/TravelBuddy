import { useState } from 'react'
import { TravelPostCard } from './TravelPostCard'
import { TravelPostModal } from './TravelPostModal'
import type { TravelPost } from '../types'

type TravelPhotoGridProps = {
  posts: TravelPost[]
}

export function TravelPhotoGrid({ posts }: TravelPhotoGridProps) {
  const [activePost, setActivePost] = useState<TravelPost | null>(null)

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
          <TravelPostCard key={post.id} post={post} onClick={setActivePost} />
        ))}
      </section>

      <TravelPostModal post={activePost} onClose={() => setActivePost(null)} />
    </>
  )
}
