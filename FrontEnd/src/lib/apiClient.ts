import { getApiBaseUrl } from '@/lib/env'
import { getAccessToken } from '@/lib/supabase'

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type ApiFetchOptions = RequestInit & {
  /** Skip attaching Supabase JWT (e.g. public health check). */
  auth?: boolean
}

/**
 * Authenticated fetch to the CRM Worker (`VITE_API_BASE_URL`).
 * Paths should start with `/api/...` per api-endpoints-guide.md.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, headers, ...init } = options
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`

  const requestHeaders = new Headers(headers)

  if (auth) {
    const token = await getAccessToken()
    if (!token) {
      throw new ApiError('Not signed in', 401)
    }
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  if (init.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as unknown) : undefined

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : response.statusText
    throw new ApiError(message, response.status, data)
  }

  return data as T
}
