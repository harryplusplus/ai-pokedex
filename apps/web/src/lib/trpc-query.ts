import type { AppRouter } from '@repo/api'
import { QueryClient } from '@tanstack/react-query'
import {
  createTRPCClient,
  httpLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
  TRPCClient,
} from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>()

const TRPC_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/trpc`

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
        }),
        false: httpLink({
          url: TRPC_API_URL,
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
