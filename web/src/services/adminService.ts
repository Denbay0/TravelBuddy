import {
  adminUsers,
  dashboardMetrics,
  managedPosts,
  managedUsers,
  onlineUsersBreakdown,
  recentActivity,
} from '../features/admin/mockData'
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

let postsStore = [...managedPosts]
let usersStore = [...managedUsers]
let adminsStore = [...adminUsers]

function includeBySearch(value: string | undefined, ...fields: string[]) {
  if (!value) {
    return true
  }

  const normalized = value.trim().toLowerCase()
  return fields.some((field) => field.toLowerCase().includes(normalized))
}

export const adminService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return Promise.resolve(dashboardMetrics)
  },

  async getOnlineUsersBreakdown(): Promise<OnlineUsersBreakdown> {
    return Promise.resolve(onlineUsersBreakdown)
  },

  async getRecentActivity(): Promise<RecentActivityItem[]> {
    return Promise.resolve(recentActivity)
  },

  async listPosts(query: ListQuery<PostStatus> = {}): Promise<ManagedPost[]> {
    const filtered = postsStore.filter((post) => {
      if (query.status && post.status !== query.status) {
        return false
      }

      return includeBySearch(query.search, post.title, post.authorName, String(post.id))
    })

    return Promise.resolve(filtered)
  },

  async listUsers(query: ListQuery<AccountStatus> = {}): Promise<ManagedUser[]> {
    const filtered = usersStore.filter((user) => {
      if (query.status && user.status !== query.status) {
        return false
      }

      return includeBySearch(query.search, user.name, user.email, String(user.id))
    })

    return Promise.resolve(filtered)
  },

  async listAdmins(query: ListQuery<AccountStatus> & { role?: AdminRole } = {}): Promise<AdminUser[]> {
    const filtered = adminsStore.filter((admin) => {
      if (query.status && admin.status !== query.status) {
        return false
      }

      if (query.role && admin.role !== query.role) {
        return false
      }

      return includeBySearch(query.search, admin.name, admin.email, String(admin.id))
    })

    return Promise.resolve(filtered)
  },

  async deletePost(postId: number): Promise<void> {
    postsStore = postsStore.filter((post) => post.id !== postId)
  },

  async deleteUser(userId: number): Promise<void> {
    usersStore = usersStore.filter((user) => user.id !== userId)
  },

  async deleteAdmin(adminId: number): Promise<void> {
    adminsStore = adminsStore.filter((admin) => admin.id !== adminId)
  },

  async createAdmin(payload: Omit<AdminUser, 'id' | 'createdAt' | 'lastActiveAt'>): Promise<AdminUser> {
    const nextAdmin: AdminUser = {
      id: Math.max(0, ...adminsStore.map((admin) => admin.id)) + 1,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      ...payload,
    }

    adminsStore = [nextAdmin, ...adminsStore]

    return Promise.resolve(nextAdmin)
  },
}
