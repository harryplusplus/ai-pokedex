import { API_URL } from './constants'

let browserAccessToken: string | null = null

export function getAccessToken(): string | null {
  return browserAccessToken
}

export function setAccessToken(accessToken: string | null) {
  browserAccessToken = accessToken
}

let fetchPromise: Promise<boolean> | null = null

export function fetchAuthRefresh(): Promise<boolean> {
  if (fetchPromise) {
    return fetchPromise
  }

  fetchPromise = fetchInternal()
  return fetchPromise
}

async function fetchInternal(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!res.ok) {
      window.location.replace('/')
      return false
    }

    const { accessToken } = (await res.json()) as {
      accessToken?: string
    }

    if (!accessToken) {
      throw new Error('Invalid response.')
    }

    browserAccessToken = accessToken

    return true
  } catch (_e) {
    browserAccessToken = null

    return false
  } finally {
    fetchPromise = null
  }
}
