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

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>()

const TRPC_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/trpc`

let browserAccessToken: string | undefined

export function setAccessToken(accessToken: string) {
  browserAccessToken = accessToken
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
            if (browserAccessToken) {
              headers['Authorization'] = `Bearer ${browserAccessToken}`
            }

            const init: EventSourcePolyfillInit = {
              headers,
            }

            return init
          },
        }),
        false: httpLink({
          url: TRPC_API_URL,
          fetch: (url, options) => {
            options ??= {}

            if (browserAccessToken) {
              const authKey = 'Authorization'
              const authValue = `Bearer ${browserAccessToken}`

              if (options.headers) {
                const { headers } = options

                if (headers instanceof Headers) {
                  headers.set(authKey, authValue)
                } else if (Array.isArray(headers)) {
                  let found = false
                  headers.forEach(([key, _], i, xs) => {
                    if (key.toLowerCase() === authKey.toLowerCase()) {
                      found = true
                      xs[i] = [authKey, authValue]
                    }
                  })

                  if (!found) {
                    headers.push([authKey, authValue])
                  }
                } else {
                  headers[authKey] = authValue
                }
              } else {
                options.headers = {
                  [authKey]: authValue,
                }
              }
            }

            return fetch(url, {
              ...options,
              credentials: 'include',
            })
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
