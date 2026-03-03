import { env } from '../config/env'
import type { ApiErrorPayload, CsrfResponse } from '../types/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let csrfTokenCache: string | null = null

function resolveErrorMessage(payload: ApiErrorPayload | null, fallback: string): string {
  if (!payload) {
    return fallback
  }

  if (typeof payload.detail === 'string') {
    return payload.detail
  }

  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    const firstError = payload.detail[0]
    if (firstError?.msg) {
      return firstError.msg
    }
  }

  return fallback
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function isMutatingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
}

export async function fetchCsrfToken(forceRefresh = false): Promise<string> {
  if (csrfTokenCache && !forceRefresh) {
    return csrfTokenCache
  }

  const response = await fetch(`${env.apiBaseUrl}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const payload = await parseJson<ApiErrorPayload>(response)
    throw new ApiError(resolveErrorMessage(payload, 'Не удалось получить CSRF токен.'), response.status)
  }

  const payload = await parseJson<CsrfResponse>(response)
  if (!payload?.csrf_token) {
    throw new ApiError('CSRF токен отсутствует в ответе сервера.', response.status)
  }

  csrfTokenCache = payload.csrf_token
  return payload.csrf_token
}

type RequestOptions = {
  method?: string
  body?: unknown
  headers?: HeadersInit
  skipCsrf?: boolean
}

const NETWORK_ERROR_MESSAGE =
  'Не удалось подключиться к серверу. Проверьте, запущен ли backend на 127.0.0.1:8000.'

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()
  const headers = new Headers(options.headers)
  const shouldUseCsrf = isMutatingMethod(method) && !options.skipCsrf

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (shouldUseCsrf) {
    try {
      const csrfToken = await fetchCsrfToken()
      headers.set('X-CSRF-Token', csrfToken)
    } catch (error) {
      if (isNetworkError(error)) {
        throw new ApiError(NETWORK_ERROR_MESSAGE, 0)
      }

      throw error
    }
  }

  let response: Response

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      credentials: 'include',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    if (isNetworkError(error)) {
      throw new ApiError(NETWORK_ERROR_MESSAGE, 0)
    }

    throw error
  }

  if (!response.ok) {
    const payload = await parseJson<ApiErrorPayload>(response)

    if ((response.status === 401 || response.status === 403) && shouldUseCsrf) {
      csrfTokenCache = null
    }

    throw new ApiError(resolveErrorMessage(payload, 'Ошибка запроса к API.'), response.status)
  }

  const data = await parseJson<T>(response)
  return (data || {}) as T
}

export function clearCsrfTokenCache() {
  csrfTokenCache = null
}
