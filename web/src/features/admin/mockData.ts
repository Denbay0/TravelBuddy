import type {
  AdminUser,
  DashboardMetrics,
  ManagedPost,
  ManagedUser,
  OnlineUsersBreakdown,
  RecentActivityItem,
} from './types'

export const dashboardMetrics: DashboardMetrics = {
  pendingReports: 18,
  publishedPosts: 124,
  newUsersLast7Days: 56,
  activeAdmins: 6,
  postTrend: 8.4,
  userTrend: 12.2,
  reportsTrend: -3.1,
}

export const onlineUsersBreakdown: OnlineUsersBreakdown = {
  totalOnline: 438,
  web: 274,
  mobile: 143,
  adminPanel: 21,
}

export const recentActivity: RecentActivityItem[] = [
  {
    id: 1,
    actor: 'Мария П.',
    action: 'reviewed report',
    target: 'Post #1024',
    createdAt: '2026-04-10T10:15:00Z',
  },
  {
    id: 2,
    actor: 'Auto moderation',
    action: 'flagged',
    target: 'Post #1027',
    createdAt: '2026-04-10T10:08:00Z',
  },
  {
    id: 3,
    actor: 'Алексей С.',
    action: 'granted admin access',
    target: 'Ольга В.',
    createdAt: '2026-04-10T09:49:00Z',
  },
]

export const managedPosts: ManagedPost[] = [
  {
    id: 1024,
    title: 'Weekend in Porto on a budget',
    authorName: 'Nina Brooks',
    status: 'published',
    reportsCount: 0,
    likesCount: 238,
    createdAt: '2026-04-09T15:20:00Z',
  },
  {
    id: 1027,
    title: 'Hidden train routes in Switzerland',
    authorName: 'Leo Grant',
    status: 'flagged',
    reportsCount: 4,
    likesCount: 190,
    createdAt: '2026-04-08T12:40:00Z',
  },
  {
    id: 1029,
    title: '3-day guide to Kyoto neighborhoods',
    authorName: 'Maya Lee',
    status: 'draft',
    reportsCount: 0,
    likesCount: 44,
    createdAt: '2026-04-07T09:30:00Z',
  },
]

export const managedUsers: ManagedUser[] = [
  {
    id: 301,
    name: 'Nina Brooks',
    email: 'nina@example.com',
    status: 'active',
    postsCount: 18,
    reportsCount: 0,
    joinedAt: '2026-01-14T11:00:00Z',
  },
  {
    id: 302,
    name: 'Leo Grant',
    email: 'leo@example.com',
    status: 'pending',
    postsCount: 6,
    reportsCount: 2,
    joinedAt: '2026-03-22T08:25:00Z',
  },
  {
    id: 303,
    name: 'Maya Lee',
    email: 'maya@example.com',
    status: 'suspended',
    postsCount: 21,
    reportsCount: 5,
    joinedAt: '2025-11-03T16:10:00Z',
  },
]

export const adminUsers: AdminUser[] = [
  {
    id: 1,
    name: 'Alex Stone',
    email: 'alex.admin@travelbuddy.dev',
    role: 'super_admin',
    status: 'active',
    lastActiveAt: '2026-04-10T10:17:00Z',
    createdAt: '2025-09-02T09:00:00Z',
  },
  {
    id: 2,
    name: 'Maria Perry',
    email: 'maria.admin@travelbuddy.dev',
    role: 'moderator',
    status: 'active',
    lastActiveAt: '2026-04-10T09:44:00Z',
    createdAt: '2025-12-11T13:10:00Z',
  },
  {
    id: 3,
    name: 'Jordan Kim',
    email: 'jordan.support@travelbuddy.dev',
    role: 'support',
    status: 'pending',
    lastActiveAt: '2026-04-09T17:35:00Z',
    createdAt: '2026-04-02T10:15:00Z',
  },
]
