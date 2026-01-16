import { API_URL } from './constants'
import { parseErrorResponse } from './utils'

let browserAccessToken: string | null = null

export function getAccessToken(): string | null {
  return browserAccessToken
}

export function setAccessToken(accessToken: string | null) {
  browserAccessToken = accessToken
}

let fetchPromise: Promise<void> | null = null

export function fetchAuthRefresh(): Promise<void> {
  if (fetchPromise) {
    return fetchPromise
  }

  fetchPromise = fetchInternal()
  return fetchPromise
}

async function fetchInternal(): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!res.ok) {
      const { message } = await parseErrorResponse(res)
      throw new Error(message)
    }

    const { accessToken } = (await res.json()) as {
      accessToken?: string
    }

    if (!accessToken) {
      throw new Error('Invalid response.')
    }

    browserAccessToken = accessToken
  } catch (e) {
    browserAccessToken = null

    throw e
  } finally {
    fetchPromise = null
  }
}

export function parseAccessToken(accessToken: string): {
  name?: string
  image?: string
} {
  return JSON.parse(atob(accessToken.split('.')[1])) as {
    name?: string
    image?: string
  }
}
