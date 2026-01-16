'use client'

import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { getQueryClient } from '@/lib/query-client'

export default function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  )
}
