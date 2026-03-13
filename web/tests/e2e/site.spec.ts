import { expect, test, type Locator, type Page, type Route } from '@playwright/test'
import type {
  ApiProfile,
  ApiProfileFavoriteRoute,
  ApiProfilePost,
  ApiRoute,
  ApiUser,
  SearchResponse,
} from '../../src/types/api'
import type { MapLocation } from '../../src/types/maps'

const FIXED_NOW = '2026-03-10T08:00:00.000Z'
const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='16' fill='%23d6d3d1'/%3E%3C/svg%3E"

const TEST_USER: ApiUser = {
  id: 17,
  name: 'E2E Explorer',
  email: 'explorer@travelbuddy.test',
  handle: '@e2e-explorer',
  avatarUrl: DEFAULT_AVATAR,
  isAdmin: false,
  createdAt: '2026-01-14T09:00:00.000Z',
}

const TEST_ADMIN: ApiUser = {
  id: 99,
  name: 'Local Admin',
  email: 'admin@travelbuddy.test',
  handle: '@local-admin',
  avatarUrl: DEFAULT_AVATAR,
  isAdmin: true,
  createdAt: '2026-01-01T08:00:00.000Z',
}

type AdminDirectoryUser = {
  id: number
  name: string
  email: string
  createdAt: string
  isAdmin: boolean
}

type AdminDirectoryPost = {
  id: number
  title: string
  city: string
  authorName: string
  createdAt: string
}

type SiteMockOptions = {
  user?: ApiUser | null
  admin?: ApiUser | null
  routes?: ApiRoute[]
  profile?: ApiProfile
  profilePosts?: ApiProfilePost[]
  favoriteRoutes?: ApiProfileFavoriteRoute[]
  adminUsers?: AdminDirectoryUser[]
  adminPosts?: AdminDirectoryPost[]
  adminAdmins?: AdminDirectoryUser[]
}

type SiteMockState = {
  currentUser: ApiUser | null
  currentAdmin: ApiUser | null
  profile: ApiProfile
  profilePosts: ApiProfilePost[]
  favoriteRoutes: ApiProfileFavoriteRoute[]
  routes: ApiRoute[]
  adminUsers: AdminDirectoryUser[]
  adminPosts: AdminDirectoryPost[]
  adminAdmins: AdminDirectoryUser[]
  nextRouteId: number
  nextAdminId: number
  mapLocations: MapLocation[]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function buildRoute(id: number, overrides: Partial<ApiRoute> = {}): ApiRoute {
  const title = overrides.title ?? `Sample Route ${id}`
  const cities = overrides.cities ?? ['Reykjavik', 'Akureyri']
  const transport = overrides.transport ?? 'Самолёт'
  const createdAt = overrides.createdAt ?? FIXED_NOW

  return {
    id,
    title,
    description: overrides.description ?? `${title} description`,
    cities,
    durationDays: overrides.durationDays ?? 5,
    transport,
    note: overrides.note ?? '',
    originName: overrides.originName ?? cities[0] ?? 'Origin',
    originLat: overrides.originLat ?? 64.1466,
    originLon: overrides.originLon ?? -21.9426,
    destinationName: overrides.destinationName ?? cities[cities.length - 1] ?? 'Destination',
    destinationLat: overrides.destinationLat ?? 65.6885,
    destinationLon: overrides.destinationLon ?? -18.1262,
    waypoints: overrides.waypoints ?? [],
    routeGeojson: overrides.routeGeojson ?? null,
    distanceKm: overrides.distanceKm ?? 380,
    routeType: overrides.routeType ?? 'real',
    savesCount: overrides.savesCount ?? 4,
    owner: overrides.owner ?? {
      id: TEST_USER.id,
      name: TEST_USER.name,
      handle: TEST_USER.handle,
    },
    isSaved: overrides.isSaved ?? false,
    createdAt,
    updatedAt: overrides.updatedAt ?? createdAt,
  }
}

function defaultRoutes(): ApiRoute[] {
  return [
    buildRoute(201, {
      title: 'Northern Lights Escape',
      cities: ['Reykjavik', 'Akureyri'],
      transport: 'Самолёт',
      durationDays: 5,
      savesCount: 8,
      distanceKm: 384,
      createdAt: '2026-03-09T10:00:00.000Z',
    }),
    buildRoute(202, {
      title: 'Baltic Train Weekend',
      cities: ['Riga', 'Jurmala'],
      transport: 'Поезд',
      durationDays: 2,
      savesCount: 5,
      distanceKm: 30,
      isSaved: true,
      createdAt: '2026-03-08T10:00:00.000Z',
    }),
    buildRoute(203, {
      title: 'City Walk Retreat',
      cities: ['Tbilisi'],
      transport: 'Пешком',
      durationDays: 1,
      savesCount: 0,
      distanceKm: 8,
      createdAt: '2026-03-10T06:00:00.000Z',
    }),
  ]
}

function defaultFavoriteRoutes(): ApiProfileFavoriteRoute[] {
  return [
    {
      id: 'fav-202',
      title: 'Baltic Train Weekend',
      cities: ['Riga', 'Jurmala'],
      durationDays: 2,
      transport: 'Поезд',
    },
  ]
}

function defaultProfilePosts(): ApiProfilePost[] {
  return [
    {
      id: 'post-1',
      title: 'Midnight Sun Diary',
      city: 'Reykjavik',
      createdAt: FIXED_NOW,
    },
  ]
}

function buildProfile(user: ApiUser = TEST_USER): ApiProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    travelTagline: 'Chasing quiet places',
    bio: 'Collecting calm routes and practical travel notes.',
    homeCity: 'Moscow',
    visitedCities: ['Reykjavik', 'Riga', 'Tbilisi'],
    travelTags: ['slow-travel', 'nature', 'weekend'],
    stats: {
      trips: 12,
      posts: 4,
      savedRoutes: 3,
      favoriteTransport: 'Самолёт',
    },
    favoriteRoutes: defaultFavoriteRoutes(),
    createdAt: user.createdAt,
  }
}

function defaultAdminUsers(): AdminDirectoryUser[] {
  return [
    {
      id: 501,
      name: 'Alice Traveler',
      email: 'alice@example.com',
      createdAt: FIXED_NOW,
      isAdmin: false,
    },
    {
      id: 502,
      name: 'Bob Moderator',
      email: 'bob@example.com',
      createdAt: FIXED_NOW,
      isAdmin: true,
    },
  ]
}

function defaultAdminPosts(): AdminDirectoryPost[] {
  return [
    {
      id: 701,
      title: 'Sunrise in Tbilisi',
      city: 'Tbilisi',
      authorName: 'Alice Traveler',
      createdAt: FIXED_NOW,
    },
    {
      id: 702,
      title: 'Weekend in Riga',
      city: 'Riga',
      authorName: 'Bob Moderator',
      createdAt: FIXED_NOW,
    },
  ]
}

function defaultAdminAdmins(): AdminDirectoryUser[] {
  return [
    {
      id: 601,
      name: 'Core Admin',
      email: 'core-admin@travelbuddy.test',
      createdAt: FIXED_NOW,
      isAdmin: true,
    },
  ]
}

function defaultMapLocations(): MapLocation[] {
  return [
    {
      label: 'Moscow, Russia',
      city: 'Moscow',
      country: 'Russia',
      lat: 55.7558,
      lon: 37.6173,
    },
    {
      label: 'Saint Petersburg, Russia',
      city: 'Saint Petersburg',
      country: 'Russia',
      lat: 59.9343,
      lon: 30.3351,
    },
    {
      label: 'Riga, Latvia',
      city: 'Riga',
      country: 'Latvia',
      lat: 56.9496,
      lon: 24.1052,
    },
  ]
}

function createSiteState(options: SiteMockOptions = {}): SiteMockState {
  const routes = clone(options.routes ?? defaultRoutes())
  const user = options.user === undefined ? null : options.user
  const profileBase = clone(options.profile ?? buildProfile(options.user ?? TEST_USER))

  return {
    currentUser: user,
    currentAdmin: options.admin === undefined ? null : options.admin,
    profile: profileBase,
    profilePosts: clone(options.profilePosts ?? defaultProfilePosts()),
    favoriteRoutes: clone(options.favoriteRoutes ?? defaultFavoriteRoutes()),
    routes,
    adminUsers: clone(options.adminUsers ?? defaultAdminUsers()),
    adminPosts: clone(options.adminPosts ?? defaultAdminPosts()),
    adminAdmins: clone(options.adminAdmins ?? defaultAdminAdmins()),
    nextRouteId: Math.max(...routes.map((item) => item.id), 300) + 1,
    nextAdminId: 900,
    mapLocations: defaultMapLocations(),
  }
}

function buildActiveProfile(state: SiteMockState): ApiProfile {
  if (!state.currentUser) {
    return state.profile
  }

  return {
    ...state.profile,
    id: state.currentUser.id,
    createdAt: state.currentUser.createdAt,
    favoriteRoutes: clone(state.favoriteRoutes),
  }
}

function paginate<T>(items: T[], page: number, limit: number) {
  const safePage = Math.max(page, 1)
  const safeLimit = Math.max(limit, 1)
  const start = (safePage - 1) * safeLimit

  return {
    items: items.slice(start, start + safeLimit),
    page: safePage,
    limit: safeLimit,
    total: items.length,
  }
}

function filterRoutesByQuery(routes: ApiRoute[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return routes
  }

  return routes.filter((route) => {
    const citiesMatch = route.cities.some((city) => city.toLowerCase().includes(normalizedQuery))
    return (
      route.title.toLowerCase().includes(normalizedQuery) ||
      route.description.toLowerCase().includes(normalizedQuery) ||
      citiesMatch
    )
  })
}

function buildSearchResponse(query: string, routes: ApiRoute[]): SearchResponse {
  const filteredRoutes = filterRoutesByQuery(routes, query).slice(0, 3)

  return {
    query,
    routes: filteredRoutes,
    posts: [
      {
        id: 801,
        title: `Community note about ${query}`,
        content: `Quick note for ${query}`,
        city: 'Reykjavik',
        transport: 'Самолёт',
        owner: {
          id: TEST_USER.id,
          name: TEST_USER.name,
          handle: TEST_USER.handle,
        },
        likesCount: 2,
        commentsCount: 1,
        savesCount: 0,
        isLiked: false,
        isSaved: false,
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      },
    ],
    users: [
      {
        id: TEST_USER.id,
        name: TEST_USER.name,
        handle: TEST_USER.handle,
        avatarUrl: TEST_USER.avatarUrl,
      },
    ],
  }
}

async function fulfillJson(route: Route, payload: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(payload),
  })
}

async function fulfillUnauthorized(route: Route) {
  await fulfillJson(route, { detail: 'Unauthorized' }, 401)
}

async function installDownloadTracker(page: Page) {
  await page.addInitScript(() => {
    ;(window as Window & { __lastDownload?: { href: string; download: string } | null }).__lastDownload = null
    const nativeClick = HTMLAnchorElement.prototype.click

    HTMLAnchorElement.prototype.click = function click() {
      if (this.download) {
        ;(window as Window & { __lastDownload?: { href: string; download: string } | null }).__lastDownload = {
          href: this.href,
          download: this.download,
        }
        return
      }

      return nativeClick.call(this)
    }
  })
}

async function installSiteApiMocks(page: Page, options: SiteMockOptions = {}) {
  const state = createSiteState(options)
  await installDownloadTracker(page)

  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

    if (request.resourceType() === 'document') {
      await route.continue()
      return
    }

    if (path === '/auth/csrf') {
      await fulfillJson(route, { csrfToken: 'playwright-csrf-token' })
      return
    }

    if (path === '/auth/me') {
      if (!state.currentUser) {
        await fulfillUnauthorized(route)
        return
      }

      await fulfillJson(route, state.currentUser)
      return
    }

    if (path === '/auth/login' && request.method() === 'POST') {
      const payload = request.postDataJSON() as { email: string }
      state.currentUser = {
        ...TEST_USER,
        email: payload.email,
      }
      await fulfillJson(route, { message: 'Logged in', user: state.currentUser, csrfToken: 'playwright-csrf-token' })
      return
    }

    if (path === '/auth/register' && request.method() === 'POST') {
      const payload = request.postDataJSON() as { name: string; email: string }
      state.currentUser = {
        ...TEST_USER,
        id: 18,
        name: payload.name,
        email: payload.email,
        handle: `@${payload.name.toLowerCase().replace(/\s+/g, '-')}`,
      }
      state.profile = {
        ...state.profile,
        name: payload.name,
        email: payload.email,
        handle: state.currentUser.handle,
      }
      await fulfillJson(route, { message: 'Registered', user: state.currentUser, csrfToken: 'playwright-csrf-token' })
      return
    }

    if (path === '/auth/logout' && request.method() === 'POST') {
      state.currentUser = null
      await fulfillJson(route, { message: 'Logged out' })
      return
    }

    if (path === '/profile/me') {
      if (!state.currentUser) {
        await fulfillUnauthorized(route)
        return
      }

      if (request.method() === 'GET') {
        await fulfillJson(route, buildActiveProfile(state))
        return
      }

      if (request.method() === 'PATCH') {
        const payload = request.postDataJSON() as Partial<ApiProfile>
        state.profile = {
          ...state.profile,
          ...payload,
          travelTags: payload.travelTags ?? state.profile.travelTags,
        }
        await fulfillJson(route, { message: 'Profile updated', profile: buildActiveProfile(state) })
        return
      }
    }

    if (path === '/profile/me/posts') {
      if (!state.currentUser) {
        await fulfillUnauthorized(route)
        return
      }

      const pageNumber = Number(url.searchParams.get('page') || 1)
      const limit = Number(url.searchParams.get('limit') || 12)
      await fulfillJson(route, paginate(state.profilePosts, pageNumber, limit))
      return
    }

    if (path === '/profile/me/favorite-routes') {
      if (!state.currentUser) {
        await fulfillUnauthorized(route)
        return
      }

      const pageNumber = Number(url.searchParams.get('page') || 1)
      const limit = Number(url.searchParams.get('limit') || 12)
      await fulfillJson(route, paginate(state.favoriteRoutes, pageNumber, limit))
      return
    }

    if (path === '/search') {
      const query = url.searchParams.get('q') || ''
      await fulfillJson(route, buildSearchResponse(query, state.routes))
      return
    }

    if (path === '/reports/example/pdf') {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF',
      })
      return
    }

    if (path === '/routes/trending') {
      const pageNumber = Number(url.searchParams.get('page') || 1)
      const limit = Number(url.searchParams.get('limit') || 12)
      const query = url.searchParams.get('q') || ''
      const sorted = [...filterRoutesByQuery(state.routes, query)].sort((left, right) => right.savesCount - left.savesCount)
      await fulfillJson(route, paginate(sorted, pageNumber, limit))
      return
    }

    if (path === '/routes' && request.resourceType() !== 'document') {
      if (request.method() === 'GET') {
        const pageNumber = Number(url.searchParams.get('page') || 1)
        const limit = Number(url.searchParams.get('limit') || 12)
        const query = url.searchParams.get('q') || ''
        const items = filterRoutesByQuery(state.routes, query)
        await fulfillJson(route, paginate(items, pageNumber, limit))
        return
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as {
          title: string
          description?: string
          durationDays: number
          transport: ApiRoute['transport']
          note?: string
          originName: string
          originLat: number
          originLon: number
          destinationName: string
          destinationLat: number
          destinationLon: number
          waypoints: { name: string; lat: number; lon: number }[]
          distanceKm: number
          routeType: 'real' | 'schematic'
          routeGeojson?: GeoJSON.Feature | null
        }

        const createdRoute = buildRoute(state.nextRouteId++, {
          title: payload.title,
          description: payload.description ?? '',
          durationDays: payload.durationDays,
          transport: payload.transport,
          note: payload.note ?? '',
          cities: [payload.originName, ...payload.waypoints.map((point) => point.name), payload.destinationName],
          originName: payload.originName,
          originLat: payload.originLat,
          originLon: payload.originLon,
          destinationName: payload.destinationName,
          destinationLat: payload.destinationLat,
          destinationLon: payload.destinationLon,
          waypoints: payload.waypoints,
          routeGeojson: payload.routeGeojson ?? null,
          distanceKm: payload.distanceKm,
          routeType: payload.routeType,
          savesCount: 0,
          isSaved: false,
          createdAt: FIXED_NOW,
          updatedAt: FIXED_NOW,
        })

        state.routes = [createdRoute, ...state.routes]
        await fulfillJson(route, createdRoute, 201)
        return
      }
    }

    if (/^\/routes\/\d+\/save$/.test(path)) {
      const routeId = Number(path.split('/')[2])
      const currentRoute = state.routes.find((item) => item.id === routeId)

      if (!currentRoute) {
        await fulfillJson(route, { detail: 'Route not found' }, 404)
        return
      }

      const shouldSave = request.method() === 'POST'
      const nextRoute = {
        ...currentRoute,
        isSaved: shouldSave,
        savesCount: shouldSave
          ? currentRoute.isSaved
            ? currentRoute.savesCount
            : currentRoute.savesCount + 1
          : Math.max(0, currentRoute.savesCount - (currentRoute.isSaved ? 1 : 0)),
      }

      state.routes = state.routes.map((item) => (item.id === routeId ? nextRoute : item))
      await fulfillJson(route, {
        message: shouldSave ? 'Saved' : 'Unsaved',
        saved: nextRoute.isSaved,
        isSaved: nextRoute.isSaved,
        saves: nextRoute.savesCount,
      })
      return
    }

    if (path === '/maps/geocode/suggest') {
      const query = (url.searchParams.get('q') || '').toLowerCase()
      const items = state.mapLocations.filter((item) => item.label.toLowerCase().includes(query))
      await fulfillJson(route, { items })
      return
    }

    if (path === '/maps/route-preview' && request.method() === 'POST') {
      const payload = request.postDataJSON() as {
        origin: { name: string; lat: number; lon: number }
        destination: { name: string; lat: number; lon: number }
        waypoints: Array<{ name: string; lat: number; lon: number }>
        transport: ApiRoute['transport']
      }

      const points = [payload.origin, ...payload.waypoints, payload.destination]
      await fulfillJson(route, {
        mode: payload.transport,
        routeType: 'real',
        distanceKm: 715,
        durationMinutes: 525,
        bounds: [
          [payload.origin.lon, payload.origin.lat],
          [payload.destination.lon, payload.destination.lat],
        ],
        points,
        geojson: null,
        warnings: [],
      })
      return
    }

    if (path === '/api/admin/auth/me') {
      if (!state.currentAdmin) {
        await fulfillUnauthorized(route)
        return
      }

      await fulfillJson(route, state.currentAdmin)
      return
    }

    if (path === '/api/admin/auth/login' && request.method() === 'POST') {
      const payload = request.postDataJSON() as { login: string; password: string }
      if (payload.login !== 'admin' || payload.password !== 'admin') {
        await fulfillUnauthorized(route)
        return
      }

      state.currentAdmin = TEST_ADMIN
      await fulfillJson(route, { message: 'Admin logged in', user: state.currentAdmin, csrfToken: 'playwright-csrf-token' })
      return
    }

    if (path === '/api/admin/auth/logout' && request.method() === 'POST') {
      state.currentAdmin = null
      await fulfillJson(route, { message: 'Admin logged out' })
      return
    }

    if (path === '/api/admin/dashboard/summary') {
      await fulfillJson(route, {
        totalUsers: state.adminUsers.length,
        totalPosts: state.adminPosts.length,
        totalRoutes: state.routes.length,
        adminUsers: state.adminAdmins.length,
      })
      return
    }

    if (path === '/api/admin/users') {
      const search = (url.searchParams.get('search') || '').toLowerCase()
      const items = state.adminUsers.filter((user) =>
        !search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
      )
      await fulfillJson(route, { items })
      return
    }

    if (/^\/api\/admin\/users\/\d+$/.test(path) && request.method() === 'DELETE') {
      const userId = Number(path.split('/').pop())
      state.adminUsers = state.adminUsers.filter((user) => user.id !== userId)
      await fulfillJson(route, { message: 'Deleted' })
      return
    }

    if (path === '/api/admin/posts') {
      const search = (url.searchParams.get('search') || '').toLowerCase()
      const items = state.adminPosts.filter((post) => !search || post.title.toLowerCase().includes(search))
      await fulfillJson(route, { items })
      return
    }

    if (/^\/api\/admin\/posts\/\d+$/.test(path) && request.method() === 'DELETE') {
      const postId = Number(path.split('/').pop())
      state.adminPosts = state.adminPosts.filter((post) => post.id !== postId)
      await fulfillJson(route, { message: 'Deleted' })
      return
    }

    if (path === '/api/admin/admins') {
      if (request.method() === 'GET') {
        await fulfillJson(route, { items: state.adminAdmins })
        return
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as { name: string; email: string }
        const createdAdmin: AdminDirectoryUser = {
          id: state.nextAdminId++,
          name: payload.name,
          email: payload.email,
          createdAt: FIXED_NOW,
          isAdmin: true,
        }
        state.adminAdmins = [createdAdmin, ...state.adminAdmins]
        await fulfillJson(route, createdAdmin, 201)
        return
      }
    }

    if (/^\/api\/admin\/admins\/\d+$/.test(path) && request.method() === 'DELETE') {
      const adminId = Number(path.split('/').pop())
      state.adminAdmins = state.adminAdmins.filter((admin) => admin.id !== adminId)
      await fulfillJson(route, { message: 'Deleted' })
      return
    }

    await route.continue()
  })
}

async function openPage(page: Page, path: string, options: SiteMockOptions = {}) {
  await installSiteApiMocks(page, options)
  await page.goto(path)
}

async function navigateWithinApp(page: Page, path: string) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, '', nextPath)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, path)
}

async function openRoutesPage(page: Page, options: SiteMockOptions = {}) {
  await openPage(page, '/', options)
  await page.locator('header a[href="/routes"]').first().click()
  await expect(page).toHaveURL(/\/routes$/)
}

function routeCard(page: Page, title: string): Locator {
  return page.locator('article').filter({ has: page.getByRole('heading', { name: title }) }).first()
}

function adminRow(page: Page, text: string): Locator {
  return page.locator('tbody tr').filter({ hasText: text }).first()
}

test('Хедер сайта: поиск, смена темы и мобильное меню работают', async ({ page }) => {
  await openPage(page, '/')

  const themeRoot = page.locator('html')
  const initialTheme = await themeRoot.getAttribute('data-theme')
  await page.getByRole('button', { name: 'Сменить тему' }).first().click()
  await expect(themeRoot).toHaveAttribute('data-theme', initialTheme === 'dark' ? 'light' : 'dark')

  const desktopSearch = page.locator('header input[placeholder*="Поиск"]').first()
  await desktopSearch.fill('Northern')
  await expect(page.getByRole('link', { name: /Northern Lights Escape/ })).toBeVisible()
  await page.getByRole('button', { name: 'Найти' }).first().click()
  await expect(page).toHaveURL(/\/routes\?q=Northern/)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Открыть меню' }).click()
  await page.locator('header a[href="/routes"]').last().click()
  await expect(page).toHaveURL(/\/routes$/)
})

test('Главная: hero CTA и финальная CTA ведут гостя на нужные страницы', async ({ page }) => {
  await openPage(page, '/')

  await page.getByRole('button', { name: 'Начать путешествие' }).click()
  await expect(page).toHaveURL(/\/routes$/)

  await page.goto('/')
  await page.getByRole('button', { name: 'Начать бесплатно' }).click()
  await expect(page).toHaveURL(/\/register$/)
})

test('Главная: кнопка "Смотреть демо" прокручивает к разделу, а модалка отчёта открывается и закрывается', async ({ page }) => {
  await openPage(page, '/')

  const highlightsHeading = page.getByRole('heading', { name: 'Всё нужное для путешествий — в спокойном ритме' })
  await page.getByRole('button', { name: 'Смотреть демо' }).click()
  await expect(highlightsHeading).toBeInViewport()

  await page.getByRole('button', { name: 'Сгенерировать пример отчёта' }).click()
  await expect(page.getByRole('heading', { name: 'Пример travel-отчёта' })).toBeVisible()
  await page.getByRole('button', { name: 'Закрыть отчёт' }).click()
  await expect(page.getByRole('heading', { name: 'Пример travel-отчёта' })).toBeHidden()
})

test('Главная: кнопка скачивания PDF в модалке запускает download flow', async ({ page }) => {
  await openPage(page, '/')

  await page.getByRole('button', { name: 'Сгенерировать пример отчёта' }).click()
  await page.getByRole('button', { name: 'Скачать PDF' }).click()

  await expect
    .poll(() => page.evaluate(() => (window as Window & { __lastDownload?: { download: string } | null }).__lastDownload?.download ?? null))
    .toBe('travelbuddy-example-report.pdf')
})

test('Публичные страницы: ссылки в футере открывают about, blog, policy и terms', async ({ page }) => {
  await openPage(page, '/')

  const pages = [
    { href: '/about', heading: 'О продукте TravelBuddy' },
    { href: '/blog', heading: 'Блог TravelBuddy' },
    { href: '/policy', heading: 'Политика конфиденциальности' },
    { href: '/terms', heading: 'Условия использования' },
  ]

  for (const target of pages) {
    await page.goto('/')
    await page.locator(`footer a[href="${target.href}"]`).click()
    await expect(page).toHaveURL(new RegExp(`${target.href}$`))
    await expect(page.getByRole('heading', { name: target.heading })).toBeVisible()
  }
})

test('Авторизация: login flow переводит пользователя в профиль', async ({ page }) => {
  await openPage(page, '/login')

  await page.locator('#login-email').fill('traveler@example.com')
  await page.locator('#login-password').fill('password123')
  await page.getByRole('button', { name: 'Войти' }).click()

  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('heading', { name: TEST_USER.name })).toBeVisible()
})

test('Регистрация: register flow создаёт аккаунт и открывает профиль', async ({ page }) => {
  await openPage(page, '/register')

  await page.locator('#register-name').fill('New Traveler')
  await page.locator('#register-email').fill('new-traveler@example.com')
  await page.locator('#register-password').fill('password123')
  await page.locator('#register-confirm-password').fill('password123')
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click()

  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('heading', { name: 'New Traveler' })).toBeVisible()
})

test('Профиль: защищённый маршрут редиректит гостя на login', async ({ page }) => {
  await openPage(page, '/')
  await navigateWithinApp(page, '/profile')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.locator('#login-email')).toBeVisible()
})

test('Профиль: пользователь редактирует профиль и выходит из аккаунта', async ({ page }) => {
  await openPage(page, '/', { user: TEST_USER })
  await page.locator('header a[href="/profile"]').first().click()
  await expect(page).toHaveURL(/\/profile$/)

  await page.getByRole('button', { name: 'Редактировать профиль' }).click()
  await page.getByPlaceholder('Имя').fill('Updated Explorer')
  await page.getByPlaceholder('Домашний город').fill('Saint Petersburg')
  await page.getByRole('button', { name: 'Сохранить' }).click()

  await expect(page.getByRole('heading', { name: 'Updated Explorer' })).toBeVisible()
  await expect(page.getByText('Домашний город: Saint Petersburg')).toBeVisible()

  await page.getByRole('button', { name: 'Выйти' }).click()
  await expect.poll(() => new URL(page.url()).pathname).not.toBe('/profile')
})

test('Маршруты: гостя отправляет на login при попытке сохранить маршрут и создать свой', async ({ page }) => {
  await openRoutesPage(page)

  await routeCard(page, 'Northern Lights Escape').getByRole('button', { name: 'Сохранить' }).click()
  await expect(page).toHaveURL(/\/login$/)

  await page.goto('/')
  await page.locator('header a[href="/routes"]').first().click()
  await expect(page).toHaveURL(/\/routes$/)
  await page.getByRole('button', { name: 'Сохранить маршрут' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test('Маршруты: пользователь открывает карточку, сохраняет маршрут и фильтрует сохранённые', async ({ page }) => {
  await openRoutesPage(page, { user: TEST_USER })

  const card = routeCard(page, 'Northern Lights Escape')
  await card.getByRole('button', { name: 'Открыть' }).click()
  await expect(page.getByRole('heading', { name: 'Northern Lights Escape' }).last()).toBeVisible()
  await page.getByRole('button', { name: 'Закрыть' }).click()

  await card.getByRole('button', { name: 'Сохранить' }).click()
  await expect(card.getByRole('button', { name: 'Убрать из сохранённых' })).toBeVisible()

  await page.getByRole('button', { name: 'Сохранённые' }).click()
  await expect(routeCard(page, 'Northern Lights Escape')).toBeVisible()
  await expect(routeCard(page, 'City Walk Retreat')).toBeHidden()
})

test('Маршруты: пользователь создаёт новый маршрут через planner', async ({ page }) => {
  await openRoutesPage(page, { user: TEST_USER })

  await page.getByRole('button', { name: 'Создать маршрут' }).first().click()
  await page.getByLabel('Название').fill('Arctic Weekend Sprint')
  await page.getByLabel('Откуда').fill('Moscow')
  await page.getByRole('button', { name: /Moscow, Russia/ }).click()
  await page.getByLabel('Куда', { exact: true }).fill('Saint')
  await page.getByRole('button', { name: /Saint Petersburg, Russia/ }).click()
  await page.getByLabel('Длительность').fill('3')
  await page.getByLabel('Заметка').fill('Weekend route created from Playwright.')

  await expect(page.getByText('Маршрут рассчитан')).toBeVisible()
  await page.getByRole('button', { name: 'Новые' }).click()
  await page.getByRole('button', { name: 'Сохранить маршрут' }).click()

  await expect(routeCard(page, 'Arctic Weekend Sprint')).toBeVisible()
})

test('Админка: защищённый маршрут редиректит на admin login', async ({ page }) => {
  await openPage(page, '/admin/dashboard')

  await expect(page).toHaveURL(/\/admin\/login$/)
  await expect(page.getByRole('heading', { name: 'Вход в админку' })).toBeVisible()
})

test('Админка: login, навигация и logout работают', async ({ page }) => {
  await openPage(page, '/admin/login')

  await page.getByRole('textbox', { name: 'Логин' }).fill('admin')
  await page.getByLabel('Пароль').fill('admin')
  await page.getByRole('button', { name: 'Войти в админку' }).click()

  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.getByRole('link', { name: 'Users' }).click()
  await expect(page).toHaveURL(/\/admin\/users$/)
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()

  await page.getByRole('link', { name: 'Admins' }).click()
  await expect(page).toHaveURL(/\/admin\/admins$/)
  await expect(page.getByRole('heading', { name: 'Admins' })).toBeVisible()

  await page.getByRole('button', { name: 'Выйти' }).click()
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('Админка: модалки create/delete обновляют таблицы posts, users и admins', async ({ page }) => {
  await openPage(page, '/admin/posts', { admin: TEST_ADMIN })

  await expect(adminRow(page, 'Sunrise in Tbilisi')).toBeVisible()
  await adminRow(page, 'Sunrise in Tbilisi').getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).last().click()
  await expect(adminRow(page, 'Sunrise in Tbilisi')).toBeHidden()

  await page.getByRole('link', { name: 'Users' }).click()
  await expect(adminRow(page, 'Alice Traveler')).toBeVisible()
  await adminRow(page, 'Alice Traveler').getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).last().click()
  await expect(adminRow(page, 'Alice Traveler')).toBeHidden()

  await page.getByRole('link', { name: 'Admins' }).click()
  await page.getByRole('button', { name: 'Create admin' }).click()
  await page.getByPlaceholder('Full name').fill('QA Admin')
  await page.getByPlaceholder('name@travelbuddy.dev').fill('qa-admin@travelbuddy.test')
  await page.getByPlaceholder('Temporary password (min 12 chars)').fill('supersecure123')
  await page.getByRole('button', { name: 'Create admin' }).last().click()
  await expect(adminRow(page, 'QA Admin')).toBeVisible()

  await adminRow(page, 'QA Admin').getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).last().click()
  await expect(adminRow(page, 'QA Admin')).toBeHidden()
})
