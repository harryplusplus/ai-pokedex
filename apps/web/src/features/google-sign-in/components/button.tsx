'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { GOOGLE_CLIENT_ID } from '../constants'
import { useGoogleSignIn } from '../context'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string
            callback: (response: GoogleSignInResponse) => void
          }) => void
          prompt: () => void
          renderButton: (element: HTMLElement, options: unknown) => void
        }
      }
    }
  }
}

export interface GoogleSignInResponse extends Record<string, unknown> {
  credential?: string
}

export interface GoogleSignInButtonProps {
  className?: string
  onResponse: (response: GoogleSignInResponse) => void
}

export default function GoogleSignInButton({
  className,
  onResponse,
}: GoogleSignInButtonProps) {
  const { status } = useGoogleSignIn()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status !== 'success' || !containerRef.current || !window.google) {
      return
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        onResponse(response)
      },
    })

    window.google.accounts.id.renderButton(containerRef.current, {})
  }, [onResponse, status])

  return <div ref={containerRef} className={cn(className)}></div>
}
