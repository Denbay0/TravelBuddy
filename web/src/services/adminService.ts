import { apiRequest } from '../lib/api'
import type {
  AccountStatus,
  AdminRole,
  AdminUser,
  DashboardMetrics,
  ManagedPost,
  ManagedUser,
  OnlineUsersBreakdown,
  PostStatus,
  RecentActivityItem,
} from '../features/admin/types'

type ListQuery<TStatus extends string> = {
  search?: string
  status?: TStatus
}

type AdminUsersApiResponse = {
  items: Array<{ id: number; name: string; email: string; createdAt: string; isAdmin: boolean }>
}

type AdminPostsApiResponse = {
  items: Array<{ id: number; title: string; city: string; authorName: string; createdAt: string }>
}

function statusFromAdminFlag(isAdmin: boolean): AccountStatus {
  return isAdmin ? 'active' : 'pending'
}

export const adminService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const summary = await apiRequest<{ totalUsers: number; totalPosts: number; totalRoutes: number; adminUsers: number }>('/api/admin/dashboard/summary')
    return {
      pendingReports: 0,
      publishedPosts: summary.totalPosts,
      newUsersLast7Days: summary.totalUsers,
      activeAdmins: summary.adminUsers,
      postTrend: 0,
      userTrend: 0,
      reportsTrend: 0,
    }
  },

  async getOnlineUsersBreakdown(): Promise<OnlineUsersBreakdown> {
    return { totalOnline: 1, web: 0, mobile: 0, adminPanel: 1 }
  },

  async getRecentActivity(): Promise<RecentActivityItem[]> {
    return []
  },

  async listPosts(query: ListQuery<PostStatus> = {}): Promise<ManagedPost[]> {
    const response = await apiRequest<AdminPostsApiResponse>(`/api/admin/posts${query.search ? `?search=${encodeURIComponent(query.search)}` : ''}`)
    return response.items
      .map((post) => ({
        id: post.id,
        title: post.title,
        authorName: post.authorName,
        status: 'published' as PostStatus,
        reportsCount: 0,
        likesCount: 0,
        createdAt: post.createdAt,
      }))
      .filter((post) => (query.status ? post.status === query.status : true))
  },

  async listUsers(query: ListQuery<AccountStatus> = {}): Promise<ManagedUser[]> {
    const response = await apiRequest<AdminUsersApiResponse>(`/api/admin/users${query.search ? `?search=${encodeURIComponent(query.search)}` : ''}`)
    return response.items
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: statusFromAdminFlag(user.isAdmin),
        postsCount: 0,
        reportsCount: 0,
        joinedAt: user.createdAt,
      }))
      .filter((user) => (query.status ? user.status === query.status : true))
  },

  async listAdmins(query: ListQuery<AccountStatus> & { role?: AdminRole } = {}): Promise<AdminUser[]> {
    const response = await apiRequest<AdminUsersApiResponse>('/api/admin/admins')
    return response.items
      .map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'super_admin' as AdminRole,
        status: 'active' as AccountStatus,
        lastActiveAt: admin.createdAt,
        createdAt: admin.createdAt,
      }))
      .filter((admin) => {
        if (query.status && admin.status !== query.status) return false
        if (query.role && admin.role !== query.role) return false
        if (query.search) {
          const value = query.search.toLowerCase()
          return admin.name.toLowerCase().includes(value) || admin.email.toLowerCase().includes(value)
        }
        return true
      })
  },

  async deletePost(postId: number): Promise<void> {
    await apiRequest(`/api/admin/posts/${postId}`, { method: 'DELETE' })
  },

  async deleteUser(userId: number): Promise<void> {
    await apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' })
  },

  async deleteAdmin(adminId: number): Promise<void> {
    await apiRequest(`/api/admin/admins/${adminId}`, { method: 'DELETE' })
  },

  async createAdmin(payload: Omit<AdminUser, 'id' | 'createdAt' | 'lastActiveAt'> & { password: string }): Promise<AdminUser> {
    const created = await apiRequest<{ id: number; name: string; email: string; createdAt: string }>('/api/admin/admins', {
      method: 'POST',
      body: { name: payload.name, email: payload.email, password: payload.password },
    })

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: payload.role,
      status: 'active',
      lastActiveAt: created.createdAt,
      createdAt: created.createdAt,
    }
  },
}
