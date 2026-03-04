export type AdminRole = 'super_admin' | 'moderator' | 'support'
export type AccountStatus = 'active' | 'suspended' | 'pending'
export type PostStatus = 'published' | 'draft' | 'flagged'

export type AdminUser = {
  id: number
  name: string
  email: string
  role: AdminRole
  status: AccountStatus
  lastActiveAt: string
  createdAt: string
}

export type ManagedUser = {
  id: number
  name: string
  email: string
  status: AccountStatus
  postsCount: number
  reportsCount: number
  joinedAt: string
}

export type ManagedPost = {
  id: number
  title: string
  authorName: string
  status: PostStatus
  reportsCount: number
  likesCount: number
  createdAt: string
}

export type DashboardMetrics = {
  pendingReports: number
  publishedPosts: number
  newUsersLast7Days: number
  activeAdmins: number
  postTrend: number
  userTrend: number
  reportsTrend: number
}

export type OnlineUsersBreakdown = {
  totalOnline: number
  web: number
  mobile: number
  adminPanel: number
}

export type RecentActivityItem = {
  id: number
  actor: string
  action: string
  target: string
  createdAt: string
}
