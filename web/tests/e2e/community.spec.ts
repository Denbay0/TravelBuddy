import { expect, test, type Locator, type Page, type Route } from '@playwright/test'
import type { ApiPost, ApiPostComment, ApiUser } from '../../src/types/api'

const FIXED_NOW = '2026-03-10T08:00:00.000Z'

const TEST_USER: ApiUser = {
  id: 7,
  name: 'E2E Traveler',
  email: 'e2e@travelbuddy.test',
  handle: '@e2e-traveler',
  avatarUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23d6d3d1'/%3E%3C/svg%3E",
  isAdmin: false,
  createdAt: '2026-01-15T10:00:00.000Z',
}

type MockCommunityState = {
  posts: ApiPost[]
  commentsByPostId: Map<number, ApiPostComment[]>
  nextPostId: number
  nextCommentId: number
}

type CreatePostInput = {
  route: string
  caption: string
  date?: string
  transport?: string
}

type CommunityMockOptions = {
  initialComments?: ApiPostComment[]
}

function buildMockComment(id: number, content: string): ApiPostComment {
  return {
    id,
    content,
    owner: {
      id: TEST_USER.id,
      name: TEST_USER.name,
      handle: TEST_USER.handle,
    },
    createdAt: FIXED_NOW,
    updatedAt: FIXED_NOW,
  }
}

function createInitialPost(initialComments: ApiPostComment[] = []): ApiPost {
  return {
    id: 100,
    title: 'Weekend in Kazan',
    content: 'Testing the community feed baseline post.',
    city: 'Казань',
    transport: 'Самолёт',
    owner: {
      id: 101,
      name: 'Existing Traveler',
      handle: '@existing-traveler',
    },
    likesCount: 12,
    commentsCount: initialComments.length,
    savesCount: 3,
    isLiked: false,
    isSaved: false,
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
  }
}

function createMockCommunityState(options: CommunityMockOptions = {}): MockCommunityState {
  const initialComments = options.initialComments ?? []
  const initialPost = createInitialPost(initialComments)

  return {
    posts: [initialPost],
    commentsByPostId: new Map([[initialPost.id, initialComments]]),
    nextPostId: 200,
    nextCommentId: initialComments.reduce((max, comment) => Math.max(max, comment.id + 1), 500),
  }
}

async function fulfillJson(route: Route, payload: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(payload),
  })
}

async function installClipboardTracker(page: Page) {
  await page.addInitScript(() => {
    let lastCopiedText = ''
    const trackedWindow = window as Window & { __lastCopiedText?: string }
    trackedWindow.__lastCopiedText = ''

    const writeText = async (text: string) => {
      lastCopiedText = text
      trackedWindow.__lastCopiedText = text
    }

    try {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText,
          readText: async () => lastCopiedText,
        },
      })
    } catch {
      trackedWindow.__lastCopiedText = ''
    }
  })
}

async function installCommunityApiMocks(page: Page, options: CommunityMockOptions = {}) {
  const state = createMockCommunityState(options)

  await installClipboardTracker(page)

  await page.route('**/auth/me', async (route) => {
    await fulfillJson(route, TEST_USER)
  })

  await page.route('**/auth/csrf', async (route) => {
    await fulfillJson(route, { csrfToken: 'playwright-csrf-token' })
  })

  await page.route('**/users/popular**', async (route) => {
    await fulfillJson(route, {
      items: [
        {
          id: 11,
          name: 'Popular Traveler',
          handle: '@popular-traveler',
          postsCount: 4,
          followersCount: 12,
        },
      ],
      page: 1,
      limit: 5,
      total: 1,
    })
  })

  await page.route('**/routes/trending**', async (route) => {
    await fulfillJson(route, {
      items: [
        {
          id: 31,
          title: 'Weekend Route',
          description: 'Trending route for tests.',
          cities: ['Москва', 'Тула'],
          durationDays: 2,
          transport: 'Поезд',
          note: '',
          originName: 'Москва',
          originLat: 55.7558,
          originLon: 37.6173,
          destinationName: 'Тула',
          destinationLat: 54.1931,
          destinationLon: 37.6175,
          waypoints: [],
          routeGeojson: null,
          distanceKm: 180,
          routeType: 'real',
          savesCount: 5,
          owner: {
            id: 11,
            name: 'Popular Traveler',
            handle: '@popular-traveler',
          },
          isSaved: false,
          createdAt: FIXED_NOW,
          updatedAt: FIXED_NOW,
        },
      ],
      page: 1,
      limit: 5,
      total: 1,
    })
  })

  await page.route(/\/posts\/\d+\/comments(?:\?.*)?$/, async (route) => {
    const request = route.request()
    const match = request.url().match(/\/posts\/(\d+)\/comments/)

    if (!match) {
      await fulfillJson(route, { detail: 'Comment route not matched.' }, 404)
      return
    }

    const postId = Number(match[1])
    const comments = state.commentsByPostId.get(postId) ?? []

    if (request.method() === 'GET') {
      const url = new URL(request.url())
      const pageNumber = Number(url.searchParams.get('page') || 1)
      const limit = Number(url.searchParams.get('limit') || comments.length || 1)
      const start = Math.max(pageNumber - 1, 0) * limit
      const items = comments.slice(start, start + limit)

      await fulfillJson(route, {
        items,
        page: pageNumber,
        limit,
        total: comments.length,
      })
      return
    }

    if (request.method() === 'POST') {
      const payload = request.postDataJSON() as { content?: string }
      const createdComment: ApiPostComment = {
        id: state.nextCommentId++,
        content: payload.content?.trim() || '',
        owner: {
          id: TEST_USER.id,
          name: TEST_USER.name,
          handle: TEST_USER.handle,
        },
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      }

      state.commentsByPostId.set(postId, [...comments, createdComment])
      state.posts = state.posts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: state.commentsByPostId.get(postId)?.length ?? post.commentsCount }
          : post,
      )

      await fulfillJson(route, createdComment, 201)
      return
    }

    await fulfillJson(route, { detail: 'Unsupported comments method.' }, 405)
  })

  await page.route(/\/posts\/\d+\/like$/, async (route) => {
    const request = route.request()
    const match = request.url().match(/\/posts\/(\d+)\/like$/)

    if (!match) {
      await fulfillJson(route, { detail: 'Like route not matched.' }, 404)
      return
    }

    const postId = Number(match[1])
    const targetPost = state.posts.find((post) => post.id === postId)

    if (!targetPost) {
      await fulfillJson(route, { detail: 'Post not found.' }, 404)
      return
    }

    if (request.method() === 'POST') {
      const nextPost = targetPost.isLiked
        ? targetPost
        : { ...targetPost, isLiked: true, likesCount: targetPost.likesCount + 1 }
      state.posts = state.posts.map((post) => (post.id === postId ? nextPost : post))

      await fulfillJson(route, {
        message: 'Post liked',
        liked: nextPost.isLiked,
        saved: nextPost.isSaved,
        isSaved: nextPost.isSaved,
        likes: nextPost.likesCount,
        saves: nextPost.savesCount,
      })
      return
    }

    if (request.method() === 'DELETE') {
      const nextPost = targetPost.isLiked
        ? { ...targetPost, isLiked: false, likesCount: Math.max(targetPost.likesCount - 1, 0) }
        : targetPost
      state.posts = state.posts.map((post) => (post.id === postId ? nextPost : post))

      await fulfillJson(route, {
        message: 'Post unliked',
        liked: nextPost.isLiked,
        saved: nextPost.isSaved,
        isSaved: nextPost.isSaved,
        likes: nextPost.likesCount,
        saves: nextPost.savesCount,
      })
      return
    }

    await fulfillJson(route, { detail: 'Unsupported like method.' }, 405)
  })

  await page.route(/\/posts\/\d+\/save$/, async (route) => {
    const request = route.request()
    const match = request.url().match(/\/posts\/(\d+)\/save$/)

    if (!match) {
      await fulfillJson(route, { detail: 'Save route not matched.' }, 404)
      return
    }

    const postId = Number(match[1])
    const targetPost = state.posts.find((post) => post.id === postId)

    if (!targetPost) {
      await fulfillJson(route, { detail: 'Post not found.' }, 404)
      return
    }

    if (request.method() === 'POST') {
      const nextPost = targetPost.isSaved
        ? targetPost
        : { ...targetPost, isSaved: true, savesCount: targetPost.savesCount + 1 }
      state.posts = state.posts.map((post) => (post.id === postId ? nextPost : post))

      await fulfillJson(route, {
        message: 'Post saved',
        liked: nextPost.isLiked,
        saved: nextPost.isSaved,
        isSaved: nextPost.isSaved,
        likes: nextPost.likesCount,
        saves: nextPost.savesCount,
      })
      return
    }

    if (request.method() === 'DELETE') {
      const nextPost = targetPost.isSaved
        ? { ...targetPost, isSaved: false, savesCount: Math.max(targetPost.savesCount - 1, 0) }
        : targetPost
      state.posts = state.posts.map((post) => (post.id === postId ? nextPost : post))

      await fulfillJson(route, {
        message: 'Post unsaved',
        liked: nextPost.isLiked,
        saved: nextPost.isSaved,
        isSaved: nextPost.isSaved,
        likes: nextPost.likesCount,
        saves: nextPost.savesCount,
      })
      return
    }

    await fulfillJson(route, { detail: 'Unsupported save method.' }, 405)
  })

  await page.route(/\/posts(?:\?.*)?$/, async (route) => {
    const request = route.request()

    if (request.method() === 'GET') {
      const url = new URL(request.url())
      const pageNumber = Number(url.searchParams.get('page') || 1)
      const limit = Number(url.searchParams.get('limit') || state.posts.length)
      const start = Math.max(pageNumber - 1, 0) * limit
      const items = state.posts.slice(start, start + limit)

      await fulfillJson(route, {
        items,
        page: pageNumber,
        limit,
        total: state.posts.length,
      })
      return
    }

    if (request.method() === 'POST') {
      const payload = request.postDataJSON() as {
        title?: string
        content?: string
        city?: string
        transport?: string
        tripDate?: string
      }

      const createdPost: ApiPost = {
        id: state.nextPostId++,
        title: payload.title?.trim() || 'Untitled post',
        content: payload.content?.trim() || '',
        city: payload.city?.trim() || 'Unknown route',
        transport: payload.transport?.trim() || 'Поезд',
        tripDate: payload.tripDate || null,
        owner: {
          id: TEST_USER.id,
          name: TEST_USER.name,
          handle: TEST_USER.handle,
        },
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
        isLiked: false,
        isSaved: false,
        createdAt: FIXED_NOW,
        updatedAt: FIXED_NOW,
      }

      state.posts = [createdPost, ...state.posts]
      state.commentsByPostId.set(createdPost.id, [])

      await fulfillJson(route, createdPost, 201)
      return
    }

    await fulfillJson(route, { detail: 'Unsupported posts method.' }, 405)
  })
}

function buildDraft(seed: string): CreatePostInput {
  return {
    route: `Маршрут ${seed}`,
    caption: `E2E публикация ${seed}`,
    date: '1999-02-23',
    transport: 'Самолёт',
  }
}

async function openCommunityPage(
  page: Page,
  options: {
    path?: string
    expectPosts?: boolean
  } = {},
) {
  await page.goto(options.path || '/community')
  await expect(page.getByTestId('community-create-post-button')).toBeVisible()

  if (options.expectPosts ?? true) {
    await expect(page.getByTestId('community-post-card').first()).toBeVisible()
  }
}

async function prepareCommunityPage(
  page: Page,
  options: CommunityMockOptions & {
    path?: string
    expectPosts?: boolean
  } = {},
) {
  await installCommunityApiMocks(page, options)
  await openCommunityPage(page, options)
}

async function createPost(page: Page, draft: CreatePostInput): Promise<Locator> {
  await page.getByTestId('community-create-post-button').click()
  const modal = page.getByTestId('community-create-post-modal')
  await expect(modal).toBeVisible()

  await modal.getByTestId('community-post-route').fill(draft.route)
  await modal.getByTestId('community-post-caption').fill(draft.caption)

  if (draft.date) {
    await modal.getByTestId('community-post-date').fill(draft.date)
  }

  if (draft.transport) {
    await modal.getByTestId('community-post-transport').selectOption(draft.transport)
  }

  await modal.getByTestId('community-post-submit').click()
  await expect(modal).toBeHidden()

  const createdCard = page
    .getByTestId('community-post-card')
    .filter({ has: page.getByTestId('community-post-caption').filter({ hasText: draft.caption }) })
    .first()

  await expect(createdCard).toBeVisible()
  return createdCard
}

async function expectShareOutcome(page: Page, shareButton: Locator) {
  const popupPromise = page
    .waitForEvent('popup', { timeout: 2_000 })
    .then(() => 'popup')
    .catch(() => null)

  const dialogPromise = page
    .waitForEvent('dialog', { timeout: 2_000 })
    .then(async (dialog) => {
      await dialog.dismiss()
      return 'dialog'
    })
    .catch(() => null)

  const toastPromise = expect
    .poll(
      async () =>
        page.locator('[role="alert"], [data-testid*="toast"], [data-testid*="snackbar"]').count(),
      { timeout: 2_000 },
    )
    .toBeGreaterThan(0)
    .then(() => 'toast')
    .catch(() => null)

  const clipboardPromise = page
    .waitForFunction(() => {
      const trackedWindow = window as Window & { __lastCopiedText?: string }
      return Boolean(trackedWindow.__lastCopiedText)
    }, undefined, { timeout: 2_000 })
    .then(() => 'clipboard')
    .catch(() => null)

  const beforeShareState = await shareButton.evaluate((element) => ({
    text: element.textContent ?? '',
    ariaPressed: element.getAttribute('aria-pressed') ?? '',
    ariaExpanded: element.getAttribute('aria-expanded') ?? '',
    className: element.className,
  }))

  const stateChangePromise = expect
    .poll(
      async () =>
        shareButton.evaluate((element, expected) => {
          return (
            (element.textContent ?? '') !== expected.text ||
            (element.getAttribute('aria-pressed') ?? '') !== expected.ariaPressed ||
            (element.getAttribute('aria-expanded') ?? '') !== expected.ariaExpanded ||
            element.className !== expected.className
          )
        }, beforeShareState),
      { timeout: 2_000 },
    )
    .toBe(true)
    .then(() => 'dom-state')
    .catch(() => null)

  await shareButton.click()

  const outcomes = await Promise.all([
    popupPromise,
    dialogPromise,
    toastPromise,
    clipboardPromise,
    stateChangePromise,
  ])
  const outcome = outcomes.find(Boolean)

  expect(
    outcome,
    'После клика по кнопке "Поделиться" не появилось ни share UI, ни toast/alert, ни копирование ссылки, ни заметное изменение DOM.',
  ).toBeTruthy()
}


test('Создание публикации: пользователь публикует пост и видит его в ленте', async ({
  page,
}) => {
  const draft = buildDraft('create-happy-path')

  await prepareCommunityPage(page)
  const createdCard = await createPost(page, draft)

  await expect(createdCard.getByTestId('community-post-caption')).toHaveText(draft.caption)
  await expect(createdCard.getByTestId('community-post-route-date')).toContainText(draft.route)
})

test('Транспорт публикации: после выбора "Самолёт" карточка должна показывать "Самолёт"', async ({
  page,
}) => {
  const draft = buildDraft('transport-check')

  await prepareCommunityPage(page)
  const createdCard = await createPost(page, draft)

  await expect(
    createdCard.getByTestId('community-post-transport'),
    'Ожидали, что карточка публикации покажет выбранный транспорт "Самолёт".',
  ).toHaveText('Самолёт')
})

test('Дата поездки: карточка должна показывать выбранную дату поездки 23.02.1999', async ({
  page,
}) => {
  const draft = buildDraft('date-check')

  await prepareCommunityPage(page)
  const createdCard = await createPost(page, draft)

  await expect(
    createdCard.getByTestId('community-post-route-date'),
    'Ожидали, что карточка публикации покажет выбранную дату поездки 23.02.1999.',
  ).toContainText(/23.*февр.*1999/i)
})

test('Комментарий: после отправки комментарий отображается в UI карточки', async ({ page }) => {
  const draft = buildDraft('comment-check')
  const commentText = 'E2E комментарий должен появиться в списке.'

  await prepareCommunityPage(page)
  const createdCard = await createPost(page, draft)

  await createdCard.getByTestId('community-post-comment-input').fill(commentText)
  await createdCard.getByTestId('community-post-comment-submit').click()

  await expect(
    createdCard.getByTestId('community-post-comment-item').filter({ hasText: commentText }),
  ).toBeVisible()
})

test('Кнопка "Поделиться": клик должен давать наблюдаемый результат', async ({ page }) => {
  const draft = buildDraft('share-check')

  await prepareCommunityPage(page)
  const createdCard = await createPost(page, draft)

  await expectShareOutcome(page, createdCard.getByTestId('community-post-share-button'))
})

test('Лента сообщества: sidebar показывает популярных авторов и трендовый маршрут', async ({
  page,
}) => {
  await prepareCommunityPage(page)

  await expect(page.getByText('Popular Traveler')).toBeVisible()
  await expect(page.getByText('Weekend Route')).toBeVisible()
})

test('Фильтрация сообщества: при отсутствии совпадений показывается empty state', async ({
  page,
}) => {
  await prepareCommunityPage(page, {
    path: '/community?q=no-matches-here',
    expectPosts: false,
  })

  await expect(page.getByText(/Ничего не найдено/i)).toBeVisible()
})

test('Комментарии публикации: существующие комментарии подгружаются и догружаются по кнопке', async ({
  page,
}) => {
  await prepareCommunityPage(page, {
    initialComments: [
      buildMockComment(401, 'Комментарий 1'),
      buildMockComment(402, 'Комментарий 2'),
      buildMockComment(403, 'Комментарий 3'),
      buildMockComment(404, 'Комментарий 4'),
    ],
  })

  const firstCard = page.getByTestId('community-post-card').first()
  const commentItems = firstCard.getByTestId('community-post-comment-item')

  await expect(commentItems).toHaveCount(3)
  await expect(firstCard.getByTestId('community-post-comments-load-more')).toBeVisible()

  await firstCard.getByTestId('community-post-comments-load-more').click()

  await expect(commentItems).toHaveCount(4)
  await expect(commentItems.last()).toContainText('Комментарий 4')
})

test('Лайк публикации: клик меняет состояние кнопки и счётчик лайков', async ({ page }) => {
  await prepareCommunityPage(page)

  const firstCard = page.getByTestId('community-post-card').first()
  const likeButton = firstCard.getByTestId('community-post-like-button')

  await expect(likeButton).toHaveAttribute('aria-pressed', 'false')
  await expect(likeButton).toContainText('12')

  await likeButton.click()
  await expect(likeButton).toHaveAttribute('aria-pressed', 'true')
  await expect(likeButton).toContainText('13')

  await likeButton.click()
  await expect(likeButton).toHaveAttribute('aria-pressed', 'false')
  await expect(likeButton).toContainText('12')
})

test('Сохранение публикации: кнопка сохраняет и снимает сохранение без перезагрузки', async ({
  page,
}) => {
  await prepareCommunityPage(page)

  const firstCard = page.getByTestId('community-post-card').first()
  const saveButton = firstCard.getByTestId('community-post-save-button')

  await expect(saveButton).toHaveAttribute('aria-pressed', 'false')

  await saveButton.click()
  await expect(saveButton).toHaveAttribute('aria-pressed', 'true')

  await saveButton.click()
  await expect(saveButton).toHaveAttribute('aria-pressed', 'false')
})
