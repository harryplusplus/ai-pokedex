'use client'

import { getQueryClient, getTrpcClient, TRPCProvider } from '@/lib/trpc-query'
import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export default function TrpcQueryProviders({
  children,
}: {
  children: ReactNode
}) {
  const queryClient = getQueryClient()
  const trpcClient = getTrpcClient()

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ error }) => <p>{error.message}</p>}
            >
              {children}
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </TRPCProvider>
    </QueryClientProvider>
  )
}
