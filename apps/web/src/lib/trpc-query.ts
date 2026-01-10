import type { AppRouter } from '@repo/api'
import { QueryClient } from '@tanstack/react-query'
import {
  createTRPCClient,
  httpLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
  type TRPCClient,
} from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import {
  EventSourcePolyfill,
  type EventSourcePolyfillInit,
} from 'event-source-polyfill'
import { fetchAuthRefresh, getAccessToken } from './auth'
import { API_URL } from './constants'
import { setHeaderToArrayHeaders } from './utils'

const TRPC_API_URL = `${API_URL}/trpc`

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>()

const AUTH_HEADER_NAME = 'Authorization'

function updateAuthHeader(headers: HeadersInit): void {
  const browserAccessToken = getAccessToken()
  if (browserAccessToken) {
    const value = `Bearer ${browserAccessToken}`

    if (headers instanceof Headers) {
      headers.set(AUTH_HEADER_NAME, value)
    } else if (Array.isArray(headers)) {
      setHeaderToArrayHeaders(headers, AUTH_HEADER_NAME, value)
    } else {
      headers[AUTH_HEADER_NAME] = value
    }
  }
}

function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          (process.env.NODE_ENV === 'development' &&
            typeof window !== 'undefined') ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      splitLink({
        condition: (op) => op.type === 'subscription',
        true: httpSubscriptionLink({
          url: TRPC_API_URL,
          EventSource: EventSourcePolyfill,
          eventSourceOptions: () => {
            const headers: Record<string, string> = {}
            updateAuthHeader(headers)

            const opts: EventSourcePolyfillInit = {
              headers,
            }

            return opts
          },
        }),
        false: httpLink({
          url: TRPC_API_URL,
          fetch: async (url, options) => {
            options ??= {}
            options.headers ??= {}
            updateAuthHeader(options.headers)

            const res = await fetch(url, options)
            if (res.status === 401) {
              const isSuccess = await fetchAuthRefresh()
              if (!isSuccess) {
                window.location.replace('/')
              } else {
                updateAuthHeader(options.headers)
                return await fetch(url, options)
              }
            }

            return res
          },
        }),
      }),
    ],
  })
}

let browserTrpcClient: TRPCClient<AppRouter> | undefined = undefined

export function getTrpcClient(): TRPCClient<AppRouter> {
  if (typeof window !== 'undefined') {
    if (!browserTrpcClient) {
      browserTrpcClient = createTrpcClient()
    }

    return browserTrpcClient
  }

  return createTrpcClient()
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient(): QueryClient {
  if (typeof window !== 'undefined') {
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient()
    }

    return browserQueryClient
  }

  return createQueryClient()
}
