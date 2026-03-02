export type TransportCategory =
  | 'plane'
  | 'train'
  | 'car'
  | 'bus'
  | 'ferry'
  | 'walk'

export type TravelPost = {
  id: string
  imageUrl: string
  title: string
  caption: string
  date: string
  likes: number
  comments: number
  routeLabel: string
  transportCategory: TransportCategory
  location: string
}
